const express = require('express');
const router = express.Router();

const clientesModel = require("../models/clientes");

router.get('/', function (req, res, next) {
    clientesModel
        .obtener()
        .then(clientes => {
            res.render("clientes/ver", {
                clientes: clientes,
            });
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo Clientes");
        });

});
router.get('/agregar', function (req, res, next) {
    res.render("clientes/agregar");
});
router.post('/insertar', function (req, res, next) {
    // Leomar: Obtener los campos del cliente desestructurados de req.body.
    // Reniel: Ojo, agregué validación para evitar nulos.
    const { cedula, nombre, apellido, direccion, telefono } = req.body;
    if (!cedula || !nombre || !apellido || !direccion || !telefono) {
        return res.status(500).send("No hay datos del cliente");
    }
    // Leomar: Todo validado, procedemos a insertar.
    clientesModel
        .insertar(cedula, nombre, apellido, direccion, telefono)
        .then(idClienteInsertado => {
            res.redirect("/clientes");
        })
        .catch(err => {
            return res.status(500).send("Error Registrando Cliente");
            
        });
});
router.get('/eliminar/:id', function (req, res, next) {
    clientesModel
        .eliminar(req.params.id)
        .then(() => {
            res.redirect("/clientes");
        })
        .catch(err => {
            return res.status(500).send("Error eliminando");
        });
});
router.get('/editar/:id', function (req, res, next) {
    clientesModel
        .obtenerPorId(req.params.id)
        .then(clientes => {
            if (clientes) {
                res.render("clientes/editar", {
                    clientes: clientes,
                });
            } else {
                return res.status(500).send("No existe Cliente con ese id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo Cliente");
        });
});
router.post('/actualizar/', function (req, res, next) {
    // Reniel: Recuperamos id y datos actualizados.
    // Leomar: Recuerda validar que el id venga en el body.
    const { id, cedula, nombre, apellido, direccion, telefono } = req.body;
    if (!nombre || !apellido || !id || !cedula || !direccion || !telefono) {
        return res.status(500).send("No hay suficientes datos");
    }
    // Reniel: Datos ok, actualizamos.
    clientesModel
        .actualizar(id, cedula, nombre, apellido, direccion, telefono)
        .then(() => {
            res.redirect("/clientes");
        })
        .catch(err => {
            return res.status(500).send("Error actualizando cliente");
        });
});

module.exports = router;
