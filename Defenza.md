# 🛡️ Guía de Defensa del Proyecto: Rhierro 5K

Esta guía sirve como estructura de presentación para la defensa del sistema **Rhierro 5K**. La exposición está dividida equitativamente entre **Leomar** y **Reniel**, basándose en los componentes, lógica y comentarios que cada uno implementó en el proyecto.

---

## 📋 Resumen General del Proyecto (Para Introducción Colectiva)
**Rhierro 5K** es un sistema web local diseñado para el **Registro Agropecuario y Control de Hierros** ganaderos. Su principal propuesta de valor es evitar que se registren hierros duplicados mediante un **motor de comprobación de similitud por visión computacional local (Índice de Jaccard)**, que compara los píxeles de un nuevo diseño (cargado o dibujado) contra los ya existentes en una base de datos MySQL, devolviendo un mapa de calor visual de solapamiento en caso de conflicto.

---

## 🎙️ Parte 1: Exposición de Leomar
*Enfoque: Lógica de Dibujo, Procesamiento de Imágenes Backend, Seguridad Transaccional y Controladores.*

### 1. Inicialización y Lógica de Dibujo (Frontend)
- **El Canvas Digital**: Explicar cómo funciona el lienzo de dibujo libre en `public/js/app.js`.
  - Configuración del contexto 2D (`ctx.lineCap = 'round'`, `ctx.strokeStyle = '#000000'`).
  - Escuchadores de eventos para detectar cuándo inicia, se mueve y se detiene el trazo del ratón o lápiz táctil.
  - Restauración y limpieza rápida del lienzo pintando un fondo blanco sólido (clave para que el análisis de píxeles posterior no falle).
  - Función de escape HTML para sanear entradas del usuario en el cliente y prevenir vulnerabilidades XSS.

### 2. Procesamiento y Normalización de Diseños (Backend)
- **Procesamiento de Imagen con Jimp**: Explicar la lógica en `utils/imageHelper.js`.
  - Cómo el backend recibe la imagen (dibujada o cargada) y la valida: debe estar en un rango de resolución de entre 200px y 1200px para garantizar rendimiento homogéneo.
  - La redimensión a un tamaño estándar de **256x256 píxeles** y conversión a escala de grises.
  - **Binarización de Luminancia**: Explicar el ciclo de revisión de píxeles:
    ```javascript
    const binaryVal = r < 180 ? 0 : 255;
    ```
    Donde los tonos oscuros inferiores a un umbral de 180 de luminancia se convierten en negro puro (`0`) y el fondo en blanco puro (`255`).

### 3. Conexiones, Modelos y Controladores Seguros
- **Conectividad a Base de Datos**: Uso de un pool de conexiones MySQL reutilizable en `conexion.js` para optimizar consultas simultáneas.
- **Consultas Preparadas**: Explicar la importancia de pasar los parámetros desestructurados a `conexion.query(...)` como arreglos (`[nombre, precio, id]`) para evitar inyecciones SQL.
- **Corrección de Bugs Críticos**: Explicar cómo se corrigieron errores de copia y pega en controladores como `models/proveedor.js`, donde originalmente se intentaban actualizar 4 campos usando un arreglo erróneo de 3 elementos (`[nombre, precio, id]`), cambiándolo por los argumentos reales (`[rif, empresa, direccion, id]`).
- **Controlador de Registro Transaccional (Paso 1)**: Inserción atómica del Productor en la base de datos antes de enlazar sus fincas asociadas.

---

## 🎙️ Parte 2: Exposición de Reniel
*Enfoque: Interfaz de Usuario Wizard, Carga de Archivos, Lógica de Comparación (Jaccard) y Rollback de Errores.*

### 1. Interfaz de Usuario Dinámica y Carga de Archivos (Frontend)
- **Navegación e Interfaz**: Explicar la barra de navegación responsive y la arquitectura por pestañas (*tabs*) controlada por clases de CSS dinámicas en `app.js`.
- **Formulario Wizard (Asistente)**: Cómo se divide el registro en 4 pasos secuenciales aplicando validaciones de campos obligatorios antes de avanzar.
- **Geolocalización Dinámica**: La vinculación lógica de los selects (Estado -> Municipio -> Parroquia) consumiendo endpoints API específicos para cargar únicamente ubicaciones reales.
- **Área de Arrastre de Archivos (Dropzone)**: Explicar el manejo de eventos drag & drop y la previsualización interactiva de la imagen cargada con opción de borrado.

### 2. Algoritmo de Similitud y Mapa de Calor (Backend)
- **Índice de Jaccard en Píxeles**: Explicar la función `calculateSimilarity` en `imageHelper.js`.
  - Explicar la fórmula matemática:
    $$\text{Jaccard} = \frac{\text{Intersección de píxeles negros comunes}}{\text{Unión de píxeles negros únicos combinados}}$$
  - Si el resultado supera el umbral del **35%** (`THRESHOLD = 0.35`), se deniega el registro para proteger los derechos del hierro existente.
- **Generación de Mapa de Calor de Colisiones**: Explicar cómo funciona `generateDiffImage`.
  - Crea un lienzo en blanco y compara píxel por píxel la propuesta nueva frente al hierro registrado conflictivo:
    - **Píxel Rojo**: Solapamiento exacto (coincidencia de trazo).
    - **Píxel Verde**: Trazo que pertenece únicamente al nuevo diseño propuesto.
    - **Píxel Gris**: Trazo original del hierro existente.
    - **Píxel Blanco**: Fondo.
  - Se genera un string Base64 del resultado y se renderiza en un comparador triple en el modal del cliente.

### 3. Integridad en Transacciones
- **Secuencialidad y Rollbacks en la BD**: Explicar el método `registrarProductorConTransaccion` en `models/productores.js`.
  - Uso de `beginTransaction` para asegurar que el productor, sus múltiples fincas y el hierro se registren correctamente.
  - Si una finca falla o el archivo no se puede guardar físicamente, se llama a `connection.rollback(...)` para deshacer los cambios en la BD.
  - Implementación de limpieza física mediante `fs.unlinkSync` para borrar archivos temporales o definitivos creados si la base de datos aborta la transacción.
