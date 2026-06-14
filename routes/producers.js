const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const productoresModel = require("../models/productores");
const estadosModel = require("../models/estados");

// Reniel: Estadísticas generales para la vista del dashboard.
router.get('/stats', (req, res) => {
  productoresModel
    .obtenerEstadisticas()
    .then(stats => res.status(200).json(stats))
    .catch(err => {
      console.error('Error al obtener estadísticas del dashboard:', err);
      res.status(500).json({ error: 'Error al obtener estadísticas del dashboard.' });
    });
});

// Leomar: Carga de estados para el combobox.
router.get('/states', (req, res) => {
  estadosModel
    .obtenerTodos()
    .then(states => res.status(200).json(states))
    .catch(err => {
      console.error('Error al obtener estados:', err);
      res.status(500).json({ error: 'Error al obtener la lista de estados.' });
    });
});

// Leomar: Municipios dinámicos por estado.
router.get('/states/:stateId/municipalities', (req, res) => {
  estadosModel
    .obtenerMunicipios(req.params.stateId)
    .then(municipalities => res.status(200).json(municipalities))
    .catch(err => {
      console.error('Error al obtener municipios:', err);
      res.status(500).json({ error: 'Error al obtener los municipios.' });
    });
});

// Reniel: Parroquias dinámicas por municipio.
router.get('/municipalities/:municipalityId/parishes', (req, res) => {
  estadosModel
    .obtenerParroquias(req.params.municipalityId)
    .then(parishes => res.status(200).json(parishes))
    .catch(err => {
      console.error('Error al obtener parroquias:', err);
      res.status(500).json({ error: 'Error al obtener las parroquias.' });
    });
});

// Leomar: Búsqueda y listado general.
router.get('/', (req, res) => {
  const { search } = req.query;
  productoresModel
    .obtenerTodos(search)
    .then(producers => res.status(200).json(producers))
    .catch(err => {
      console.error('Error al obtener productores:', err);
      res.status(500).json({ error: 'Error al obtener el listado de productores.' });
    });
});

// Reniel: Registro completo transaccional.
router.post('/', (req, res) => {
  const { cedula, nombre, telefono, email, estado_id, fincas, marca_nombre, tempFileName } = req.body;

  if (!cedula || !nombre || !telefono || !email || !estado_id || !marca_nombre || !tempFileName) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  let parsedFincas = [];
  try {
    parsedFincas = typeof fincas === 'string' ? JSON.parse(fincas) : fincas || [];
  } catch (e) {
    return res.status(400).json({ error: 'El formato de las fincas es inválido.' });
  }

  if (parsedFincas.length === 0) {
    return res.status(400).json({ error: 'Debe agregar al menos una finca o predio.' });
  }

  // Leomar: Rutas para la imagen temporal de la validación.
  // Reniel: Al final decidimos guardarla en uploads/temp dentro del proyecto.
  const tempFilePath = path.join(__dirname, '../uploads/temp', tempFileName);
  if (!fs.existsSync(tempFilePath)) {
    return res.status(400).json({ error: 'La imagen de hierro temporal no se encuentra. Por favor, vuelva a validarla.' });
  }

  const permanentFileName = `${Date.now()}-${tempFileName}`;
  const destDir = path.join(__dirname, '../uploads/hierros');
  const permanentFilePath = path.join(destDir, permanentFileName);
  const relativeImagePath = `uploads/hierros/${permanentFileName}`;

  productoresModel
    .registrarProductorConTransaccion({
      cedula,
      nombre,
      telefono,
      email,
      estado_id,
      fincas: parsedFincas,
      marca_nombre,
      relativeImagePath,
      tempFilePath,
      permanentFilePath
    })
    .then(result => {
      res.status(201).json({
        success: true,
        message: 'Productor registrado exitosamente.',
        productorId: result.productorId,
        hierroCodigo: result.hierroCodigo
      });
    })
    .catch(err => {
      console.error('Error al registrar productor:', err);
      // Leomar: Rollback manual de la imagen si falla la BD.
      if (fs.existsSync(permanentFilePath)) {
        try { fs.unlinkSync(permanentFilePath); } catch (e) {}
      }
      res.status(500).json({ error: err.message || 'Error del servidor al registrar el productor.' });
    });
});

module.exports = router;
