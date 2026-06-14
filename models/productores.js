const conexion = require("../conexion");

module.exports = {
  /**
   * Leomar: Obtiene estadísticas para el Dashboard en paralelo.
   * Reniel: Usamos Promise.all para que corra más rápido.
   */
  obtenerEstadisticas() {
    return new Promise((resolve, reject) => {
      const q1 = "SELECT COUNT(*) AS totalProductores FROM productores";
      const q2 = "SELECT COUNT(*) AS totalFincas FROM fincas";
      const q3 = "SELECT COUNT(*) AS hierrosActivos FROM hierros WHERE estatus = 'activo'";
      const q4 = "SELECT COUNT(*) AS hierrosInactivos FROM hierros WHERE estatus = 'inactivo'";
      const q5 = `
        SELECT e.nombre, COUNT(p.id) AS cantidad 
        FROM productores p
        JOIN estados e ON p.estado_id = e.id
        GROUP BY e.id
        ORDER BY cantidad DESC
        LIMIT 1
      `;

      const ejecutarQuery = (sql) => {
        return new Promise((res, rej) => {
          conexion.query(sql, (err, result) => {
            if (err) rej(err);
            else res(result);
          });
        });
      };

      Promise.all([
        ejecutarQuery(q1),
        ejecutarQuery(q2),
        ejecutarQuery(q3),
        ejecutarQuery(q4),
        ejecutarQuery(q5)
      ])
        .then(([r1, r2, r3, r4, r5]) => {
          const totalProductores = r1[0].totalProductores;
          const totalFincas = r2[0].totalFincas;
          const hierrosActivos = r3[0].hierrosActivos;
          const hierrosInactivos = r4[0].hierrosInactivos;
          const topState = r5[0] ? `${r5[0].nombre} (${r5[0].cantidad})` : 'Ninguno';

          resolve({
            totalProductores,
            totalFincas,
            hierrosActivos,
            hierrosInactivos,
            topState
          });
        })
        .catch(err => reject(err));
    });
  },

  /**
   * Reniel: Listado de productores con filtro de búsqueda de texto.
   * Leomar: Trae también las fincas de cada productor.
   */
  obtenerTodos(search) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT p.*, e.nombre AS estado_nombre, e.codigo AS estado_codigo,
        h.marca_nombre, h.hierro_codigo, h.hierro_imagen_url, h.estatus AS hierro_estatus
        FROM productores p
        JOIN estados e ON p.estado_id = e.id
        LEFT JOIN hierros h ON p.id = h.productor_id
      `;
      
      let params = [];
      if (search) {
        query += ` WHERE p.nombre LIKE ? OR p.cedula LIKE ? OR h.hierro_codigo LIKE ? `;
        const searchWild = `%${search}%`;
        params = [searchWild, searchWild, searchWild];
      }
      
      query += ` ORDER BY p.created_at DESC `;

      conexion.query(query, params, (err, producers) => {
        if (err) return reject(err);

        conexion.query("SELECT * FROM fincas", (errF, allFincas) => {
          if (errF) return reject(errF);

          const result = producers.map(p => {
            const fincas = allFincas.filter(f => f.productor_id === p.id);
            return {
              ...p,
              fincas
            };
          });

          resolve(result);
        });
      });
    });
  },

  /**
   * Leomar: Transacción atómica de registro completo.
   * Reniel: Si algo falla, se ejecuta el rollback del archivo físico y de la DB.
   */
  registrarProductorConTransaccion(datos) {
    return new Promise((resolve, reject) => {
      const {
        cedula,
        nombre,
        telefono,
        email,
        estado_id,
        fincas,
        marca_nombre,
        relativeImagePath,
        tempFilePath,
        permanentFilePath
      } = datos;

      conexion.getConnection((err, connection) => {
        if (err) return reject(err);

        connection.beginTransaction(errTx => {
          if (errTx) {
            connection.release();
            return reject(errTx);
          }

          const rollback = (error) => {
            connection.rollback(() => {
              connection.release();
              reject(error);
            });
          };

          // Leomar: Paso 1 - Insertar Productor primero
          connection.query(`
            INSERT INTO productores (cedula, nombre, telefono, email, estado_id)
            VALUES (?, ?, ?, ?, ?)
          `, [cedula, nombre, telefono, email, estado_id], (errProd, producerResult) => {
            if (errProd) {
              if (errProd.code === 'ER_DUP_ENTRY') {
                return rollback(new Error('La cédula ingresada ya se encuentra registrada para otro productor.'));
              }
              return rollback(errProd);
            }

            const productorId = producerResult.insertId;

            // Reniel: Paso 2 - Insertar Fincas una por una recursivamente
            let index = 0;
            const insertarSiguienteFinca = () => {
              if (index >= fincas.length) {
                // Leomar: Confirmar archivo en su ruta definitiva
                try {
                  const fs = require('fs');
                  const path = require('path');
                  const destDir = path.dirname(permanentFilePath);
                  if (!fs.existsSync(destDir)) {
                    fs.mkdirSync(destDir, { recursive: true });
                  }
                  fs.renameSync(tempFilePath, permanentFilePath);
                } catch (fsErr) {
                  return rollback(fsErr);
                }

                // Reniel: Generar el código de hierro reglamentario
                connection.query('SELECT codigo FROM estados WHERE id = ?', [estado_id], (errState, stateResult) => {
                  if (errState || !stateResult[0]) {
                    return rollback(errState || new Error('El estado seleccionado no existe.'));
                  }

                  const stateCode = stateResult[0].codigo;
                  const prediosCount = fincas.length;
                  const hierroCodigo = `${stateCode}-${prediosCount}-${productorId}-ACT`;

                  // Leomar: Paso 3 - Insertar Hierro ya verificado
                  connection.query(`
                    INSERT INTO hierros (productor_id, marca_nombre, hierro_codigo, hierro_imagen_url, estatus)
                    VALUES (?, ?, ?, ?, 'activo')
                  `, [productorId, marca_nombre, hierroCodigo, relativeImagePath], (errIron) => {
                    if (errIron) {
                      const fs = require('fs');
                      if (fs.existsSync(permanentFilePath)) {
                        fs.unlinkSync(permanentFilePath);
                      }
                      return rollback(errIron);
                    }

                    // Reniel: Confirmar transacción completa si no hubo fallos
                    connection.commit(errCommit => {
                      if (errCommit) return rollback(errCommit);
                      connection.release();
                      resolve({
                        productorId,
                        hierroCodigo
                      });
                    });
                  });
                });
                return;
              }

              const finca = fincas[index];
              connection.query(`
                INSERT INTO fincas (productor_id, nombre, municipio, parroquia, sector, superficie)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [productorId, finca.nombre, finca.municipio, finca.parroquia, finca.sector, finca.superficie], (errFinca) => {
                if (errFinca) return rollback(errFinca);
                index++;
                insertarSiguienteFinca();
              });
            };

            insertarSiguienteFinca();
          });
        });
      });
    });
  }
};
