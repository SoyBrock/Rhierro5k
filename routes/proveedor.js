const express = require('express');
const router = express.Router();

const proveedorModel = require("../models/proveedor");
const proveedor = require('../models/proveedor');

router.get('/', function (req, res, next) {
    proveedorModel
        .obtener()
        .then(proveedor => {
            res.render("proveedor/ver", {
                proveedor: proveedor,
            });
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo proveedor");
        });

});
router.get('/agregar', function (req, res, next) {
    res.render("proveedor/agregar");
});
router.post('/insertar', function (req, res, next) {

    const { rif, empresa, direccion } = req.body;
    if (!rif || !empresa || !direccion ) {
        return res.status(500).send("No hay datos para Registrar");
    }
    // Leomar: Los datos mínimos de proveedor están listos, guardamos en base de datos.
    proveedorModel
        .insertar(rif, empresa, direccion)
        .then(idProveedorInsertado => {
            res.redirect("/proveedor");
        })
        .catch(err => {
            return res.status(500).send("Error insertando Proveedor");
        });
});
router.get('/eliminar/:id', function (req, res, next) {
    proveedorModel
        .eliminar(req.params.id)
        .then(() => {
            res.redirect("/proveedor");
        })
        .catch(err => {
            return res.status(500).send("Error eliminando");
        });
});
router.get('/editar/:id', function (req, res, next) {
    proveedorModel
        .obtenerPorId(req.params.id)
        .then(proveedor => {
            if (proveedor) {
                res.render("proveedor/editar", {
                    proveedor: proveedor,
                });
            } else {
                return res.status(500).send("No existe proveedor con ese id");
            }
        })
        .catch(err => {
            return res.status(500).send("Error obteniendo proveedor");
        });
});
router.post('/actualizar/', function (req, res, next) {
    // Reniel: Ojo, este comentario hablaba de nombre y precio. Lo corrijo.
    // Recuperamos los campos de proveedor desestructurados de req.body.
    const { id, empresa, direccion, rif } = req.body;
    if (!empresa || !direccion || !id || !rif) {
        return res.status(500).send("No hay suficientes datos");
    }
    // Leomar: Validación completada, actualizamos el proveedor.
    proveedorModel
        .actualizar(id, empresa, direccion, rif)
        .then(() => {
            res.redirect("/proveedor");
        })
        .catch(err => {
            return res.status(500).send("Error actualizando Proveedor");
        });
});

module.exports = router;
