// Reniel: Obtenemos el listado de todos los hierros para la comparación Jaccard.
// Leomar: Agregué el JOIN con productores para saber a quién pertenece si hay colisión.
const conexion = require("../conexion");

module.exports = {
  obtenerTodos() {
    return new Promise((resolve, reject) => {
      conexion.query(
        `SELECT h.id, h.hierro_codigo, h.hierro_imagen_url, h.marca_nombre, p.nombre AS productor_nombre
        FROM hierros h
        JOIN productores p ON h.productor_id = p.id`,
        (err, resultados) => {
          if (err) reject(err);
          else resolve(resultados);
        }
      );
    });
  }
};
