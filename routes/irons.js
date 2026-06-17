const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const hierrosModel = require("../models/hierros");
const { processAndValidateImage, calculateSimilarity, generateDiffImage } = require('../utils/imageHelper');

const THRESHOLD = 0.35; // Leomar: 35% de coincidencia sobre pixeles negros es el límite para considerarlo duplicado

// Reniel: Nos aseguramos de que el directorio temporal exista.
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Leomar: Configuración de multer para las subidas temporales.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Reniel: Validación de tipo de archivo por seguridad.
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes JPEG, JPG y PNG.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB de tamaño máximo
  }
});

// Leomar: Middleware para interceptar y validar el archivo subido.
const uploadMiddleware = (req, res, next) => {
  upload.single('hierro')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// Reniel: Endpoint principal para la validación automática contra la BD.
router.post('/validate', uploadMiddleware, (req, res) => {
  let tempPath = null;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Debe proporcionar una imagen para el hierro.' });
  }

  tempPath = req.file.path;
  let newProcessed;

  // Leomar: 1) Normalizar y binarizar la propuesta.
  processAndValidateImage(tempPath)
    .then(processed => {
      newProcessed = processed;
      // Reniel: 2) Recuperar los hierros activos.
      return hierrosModel.obtenerTodos();
    })
    .then(existingIrons => {
      let highestSimilarity = 0;
      let conflictIron = null;
      let diffPromises = [];
      let mappedIrons = [];

      // Leomar: 3) Búsqueda paralela de similitudes con Jaccard.
      // Reniel: Usar Promise.all previene bloqueos del event loop.
      const comparisons = existingIrons.map(iron => {
        const normalizedPath = iron.hierro_imagen_url.replace(/\\/g, '/');
        // Leomar: Las imágenes se sirven y guardan relativas a la raíz del proyecto.
        const existingImagePath = path.join(__dirname, '../', normalizedPath);

        if (fs.existsSync(existingImagePath)) {
          return processAndValidateImage(existingImagePath)
            .then(existingProcessed => {
              const similarity = calculateSimilarity(newProcessed, existingProcessed);
              return { iron, similarity, existingProcessed };
            })
            .catch(err => {
              console.error(`Error procesando hierro de base de datos #${iron.id}:`, err);
              return null;
            });
        } else {
          return Promise.resolve(null);
        }
      });

      return Promise.all(comparisons);
    })
    .then(results => {
      const validResults = results.filter(r => r !== null);
      validResults.sort((a, b) => b.similarity - a.similarity);

      const highestSimilarity = validResults.length > 0 ? validResults[0].similarity : 0;
      const accepted = highestSimilarity < THRESHOLD;
      const similarityPercentage = Math.round(highestSimilarity * 100);

      const response = {
        accepted,
        similarityScore: similarityPercentage,
        threshold: Math.round(THRESHOLD * 100),
        tempFileName: req.file.filename,
        similarIrons: []
      };

      const topMatches = validResults.slice(0, 5);

      const diffPromises = topMatches.map(match => {
        return generateDiffImage(newProcessed, match.existingProcessed)
          .then(diffBase64 => {
            return {
              productor: match.iron.productor_nombre,
              marca: match.iron.marca_nombre,
              codigo: match.iron.hierro_codigo,
              imagenUrl: match.iron.hierro_imagen_url,
              similarityScore: Math.round(match.similarity * 100),
              diffImage: diffBase64,
              consejos: [
                'Rotar el diseño 45° o 90° para cambiar la orientación de las figuras.',
                'Agregar una inicial o letra distintiva al diseño principal (ej: inicial del productor).',
                'Enmarcar el hierro actual dentro de una figura geométrica simple (un círculo, escudo o cuadrado).',
                'Añadir una barra horizontal inferior ("marca de barra") o una estrella.'
              ]
            };
          });
      });

      return Promise.all(diffPromises)
        .then(similarIrons => {
          response.similarIrons = similarIrons;

          if (!accepted) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }

          return res.status(200).json(response);
        })
        .catch(err => {
          console.error('Error generando mapas de diferencias:', err);
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          return res.status(500).json({ error: 'Error al generar el mapa de calor de similitudes.' });
        });
    })
    .catch(err => {
      console.error('Error al validar similitud del hierro:', err);
      if (tempPath && fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (e) {}
      }
      return res.status(400).json({ error: err.message || 'Error del servidor al analizar la similitud del hierro.' });
    });
});

module.exports = router;
