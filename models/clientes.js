// Reniel: Modulo de acceso a datos para la tabla clientes.
// Leomar: Agregué la conexión pool en la primera línea.
const conexion = require("../conexion")
module.exports = {
    insertar(cedula,nombre, apellido, direccion, telefono) {
        return new Promise((resolve, reject) => {
            // Leomar: Retornamos el insertId por si necesitamos redirigir o trackearlo.
            sql = conexion.query(`insert into clientes (cedula, nombre, apellido, direccion, telefono) values (?, ?, ?, ?, ?)`,
                [cedula,nombre, apellido, direccion, telefono], (err, resultados) => {
                    if (err) reject(err);
                    else resolve(resultados.insertId);
                });
        });
    },
    obtener() {
        return new Promise((resolve, reject) => {
            conexion.query(`select id, cedula, nombre, apellido, direccion, telefono from clientes`,
                (err, resultados) => {
                    if (err) reject(err);
                    else resolve(resultados);
                });
        });
    },
    obtenerPorId(id) {
        return new Promise((resolve, reject) => {
            conexion.query(`select id, cedula, nombre, apellido, direccion, telefono from clientes where id = ?`,
                [id],
                (err, resultados) => {
                    if (err) reject(err);
                    else resolve(resultados[0]);
                });
        });
    },
    actualizar(id, cedula, nombre, apellido, direccion, telefono) {
        return new Promise((resolve, reject) => {
            sql = conexion.query(`update clientes set cedula = ?, nombre = ?, apellido = ?, direccion = ?, telefono = ? where id = ?`,
                [cedula, nombre, apellido, direccion, telefono, id],
                (err) => {
                    // Reniel: Removido el console.log temporal que tenías, Leomar.
                    if (err) reject(err);
                    else resolve();
                });
        });
    },
    eliminar(id) {
        return new Promise((resolve, reject) => {
            conexion.query(`delete from clientes
            where id = ?`,
                [id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
    },
}