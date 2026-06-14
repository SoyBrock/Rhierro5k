// Reniel: Modulo de acceso a datos para la tabla de proveedores.
// Leomar: Agregué consultas preparadas.
const conexion = require("../conexion")
module.exports = {
    insertar(rif, empresa, direccion) {
        return new Promise((resolve, reject) => {
            conexion.query(`insert into proveedor (rif, empresa, direccion) values (?, ?, ?)`,
                [rif, empresa, direccion], (err, resultados) => {
                    if (err) reject(err);
                    else resolve(resultados.insertId);
                });
        });
    },
    obtener() {
        return new Promise((resolve, reject) => {
            conexion.query(`select id, empresa, direccion, rif from proveedor`,
                (err, resultados) => {
                    if (err) reject(err);
                    else resolve(resultados);
                });
        });
    },
    obtenerPorId(id) {
        return new Promise((resolve, reject) => {
            conexion.query(`select id, empresa, direccion, rif from proveedor where id = ?`,
                [id],
                (err, resultados) => {
                    if (err) reject(err);
                    else resolve(resultados[0]);
                });
        });
    },
    actualizar(id, empresa, direccion, rif) {
        return new Promise((resolve, reject) => {
            // Leomar: Corregí los parámetros de la consulta que estaban copiados de productos.
            // Reniel: ¡Buen ojo! Cambiado [nombre, precio, id] por [rif, empresa, direccion, id].
            conexion.query(`update proveedor
            set rif = ?,
            empresa = ?,
            direccion = ?
            where id = ?`,
                [rif, empresa, direccion, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    },
    eliminar(id) {
        return new Promise((resolve, reject) => {
            conexion.query(`delete from proveedor
            where id = ?`,
                [id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    },
}