// Leomar: Login temporal por contraseña plana.
// Reniel: Ojo, en producción debemos usar bcrypt para hashear esto. Queda pendiente.
const conexion = require("../conexion")
module.exports = {

    validar(login, password) {
        return new Promise((resolve, reject) => {
            sql = conexion.query(`select login, password from usuarios where (login = ? and password = ?)`,
                [login, password],
                (err, resultados) => {
                    if (err) reject(err);
                    else
                    resolve(resultados[0]);
                });
        });
    },

}

