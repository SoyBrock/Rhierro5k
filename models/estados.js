// Leomar: Consultas para la carga geográfica jerárquica.
// Reniel: Ordené alfabéticamente (ASC) para mejorar la UX de los dropdowns.
const conexion = require("../conexion");

module.exports = {
  obtenerTodos() {
    return new Promise((resolve, reject) => {
      conexion.query("SELECT * FROM estados ORDER BY nombre ASC", (err, resultados) => {
        if (err) reject(err);
        else resolve(resultados);
      });
    });
  },

  obtenerMunicipios(estadoId) {
    return new Promise((resolve, reject) => {
      conexion.query(
        "SELECT id, nombre FROM municipios WHERE estado_id = ? ORDER BY nombre ASC",
        [estadoId],
        (err, resultados) => {
          if (err) reject(err);
          else resolve(resultados);
        }
      );
    });
  },

  obtenerParroquias(municipioId) {
    return new Promise((resolve, reject) => {
      conexion.query(
        "SELECT id, nombre FROM parroquias WHERE municipio_id = ? ORDER BY nombre ASC",
        [municipioId],
        (err, resultados) => {
          if (err) reject(err);
          else resolve(resultados);
        }
      );
    });
  }
};
