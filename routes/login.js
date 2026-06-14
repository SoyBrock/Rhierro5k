const express = require('express');
const router = express.Router();

const loginModel = require("../models/login");

router.post('/envio', function (req, res, next) {
    // Reniel: Obtenemos credenciales de req.body.
    // Leomar: Desestructurar es más limpio.
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(500).send("No hay datos del Usuario");
    }
    // Leomar: Datos validados, vamos a verificar en la base de datos.
    loginModel
        .validar(login, password)
        .then((resultados) => {
            // Reniel: Si encontramos coincidencia, procedemos con la sesión.
			if (resultados.length > 0) {
				// Leomar: Autenticar guardando estado en la sesión de express.
				req.session.loggedin = true;
				req.session.login = login;
				// Reniel: Redirigir a clientes como página por defecto.
                res.redirect("/clientes");
        } else {
            res.send('Usuario y/o Contraseña Incorrecta');
            res.end();
        }	
            

        })
        .catch(err => {
            return res.status(500).send("Error Validando Usuario");
            
        });
});


module.exports = router;
