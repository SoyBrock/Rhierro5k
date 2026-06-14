const Jimp = require('jimp');

/**
 * Leomar: Procesa y valida una imagen de hierro.
 * Reniel: Agregué la binarización para optimizar la comparación.
 */
async function processAndValidateImage(imagePath) {
  const image = await Jimp.read(imagePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Leomar: Validar límites de píxeles para que la comparación sea homogénea.
  if (width < 200 || height < 200 || width > 1200 || height > 1200) {
    throw new Error(`Dimensiones inválidas: El hierro debe tener entre 200px y 1200px. Subiste: ${width}x${height}px`);
  }

  // Reniel: Redimensionamos y pasamos a escala de grises.
  const processed = image.clone()
    .resize(256, 256)
    .grayscale();

  // Leomar: Binarizamos usando luminancia media.
  const data = processed.bitmap.data;
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    // Reniel: Umbral de 180 (menos de 180 = trazo, más de 180 = fondo).
    const binaryVal = r < 180 ? 0 : 255;
    data[i] = binaryVal;     // R
    data[i + 1] = binaryVal; // G
    data[i + 2] = binaryVal; // B
    data[i + 3] = 255;       // A (opaco)
  }

  return processed;
}

/**
 * Reniel: Compara dos imágenes pre-procesadas usando el Índice de Jaccard sobre pixeles negros.
 * Leomar: Jaccard = (Pixeles Negros Comunes) / (Total de Pixeles Negros Únicos Combinados)
 */
function calculateSimilarity(img1, img2) {
  const data1 = img1.bitmap.data;
  const data2 = img2.bitmap.data;
  const len = data1.length;

  let intersection = 0;
  let union = 0;

  for (let i = 0; i < len; i += 4) {
    // Leomar: 0 indica pixel negro (trazo de hierro binarizado).
    const isBlack1 = data1[i] === 0;
    const isBlack2 = data2[i] === 0;

    if (isBlack1 || isBlack2) {
      union++;
      if (isBlack1 && isBlack2) {
        intersection++;
      }
    }
  }

  return union === 0 ? 0 : intersection / union;
}

/**
 * Leomar: Genera una imagen con el mapa de diferencias (overlap) entre dos hierros.
 * Reniel: Útil para mostrar al usuario por qué fue rechazado su diseño.
 */
async function generateDiffImage(img1, img2) {
  const data1 = img1.bitmap.data;
  const data2 = img2.bitmap.data;
  const len = data1.length;

  // Reniel: Creamos lienzo blanco base para pintar la diferencia.
  const diffImg = await new Promise((resolve, reject) => {
    new Jimp(256, 256, 0xFFFFFFFF, (err, image) => {
      if (err) reject(err);
      else resolve(image);
    });
  });

  const diffData = diffImg.bitmap.data;

  for (let i = 0; i < len; i += 4) {
    const isBlack1 = data1[i] === 0;
    const isBlack2 = data2[i] === 0;

    if (isBlack1 && isBlack2) {
      // Coincidencia (Superposición) -> Rojo
      diffData[i] = 255;
      diffData[i + 1] = 0;
      diffData[i + 2] = 0;
      diffData[i + 3] = 255;
    } else if (isBlack1) {
      // Nuevo hierro solamente -> Verde
      diffData[i] = 46;
      diffData[i + 1] = 184;
      diffData[i + 2] = 114;
      diffData[i + 3] = 255;
    } else if (isBlack2) {
      // Hierro existente solamente -> Gris Oscuro
      diffData[i] = 160;
      diffData[i + 1] = 160;
      diffData[i + 2] = 160;
      diffData[i + 3] = 255;
    } else {
      // Fondo -> Blanco
      diffData[i] = 255;
      diffData[i + 1] = 255;
      diffData[i + 2] = 255;
      diffData[i + 3] = 255;
    }
  }

  return diffImg.getBase64Async(Jimp.MIME_PNG);
}

module.exports = {
  processAndValidateImage,
  calculateSimilarity,
  generateDiffImage
};
