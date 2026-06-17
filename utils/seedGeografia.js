const conexion = require("../conexion");

const estados = [
  { id: 1, nombre: 'Zulia', codigo: 'ZUL' },
  { id: 2, nombre: 'Lara', codigo: 'LAR' },
  { id: 3, nombre: 'Falcón', codigo: 'FAL' },
  { id: 4, nombre: 'Amazonas', codigo: 'AMA' },
  { id: 5, nombre: 'Anzoátegui', codigo: 'ANZ' },
  { id: 6, nombre: 'Apure', codigo: 'APU' },
  { id: 7, nombre: 'Aragua', codigo: 'ARA' },
  { id: 8, nombre: 'Barinas', codigo: 'BAR' },
  { id: 9, nombre: 'Bolívar', codigo: 'BOL' },
  { id: 10, nombre: 'Carabobo', codigo: 'CAR' },
  { id: 11, nombre: 'Cojedes', codigo: 'COJ' },
  { id: 12, nombre: 'Delta Amacuro', codigo: 'DEL' },
  { id: 13, nombre: 'Distrito Capital', codigo: 'DCA' },
  { id: 14, nombre: 'Guárico', codigo: 'GUA' },
  { id: 15, nombre: 'Mérida', codigo: 'MER' },
  { id: 16, nombre: 'Miranda', codigo: 'MIR' },
  { id: 17, nombre: 'Monagas', codigo: 'MON' },
  { id: 18, nombre: 'Nueva Esparta', codigo: 'NES' },
  { id: 19, nombre: 'Portuguesa', codigo: 'POR' },
  { id: 20, nombre: 'Sucre', codigo: 'SUC' },
  { id: 21, nombre: 'Táchira', codigo: 'TAC' },
  { id: 22, nombre: 'Trujillo', codigo: 'TRU' },
  { id: 23, nombre: 'La Guaira', codigo: 'LGU' },
  { id: 24, nombre: 'Yaracuy', codigo: 'YAR' },
  { id: 25, nombre: 'Dependencias Federales', codigo: 'DFE' }
];

const municipios = [
  { id: 1, estado_id: 1, nombre: 'Maracaibo' },
  { id: 2, estado_id: 1, nombre: 'San Francisco' },
  { id: 3, estado_id: 2, nombre: 'Iribarren' },
  { id: 4, estado_id: 3, nombre: 'Miranda' },
  { id: 5, estado_id: 4, nombre: 'Atures' },
  { id: 6, estado_id: 5, nombre: 'Simón Bolívar' },
  { id: 7, estado_id: 6, nombre: 'San Fernando' },
  { id: 8, estado_id: 7, nombre: 'Girardot' },
  { id: 9, estado_id: 8, nombre: 'Barinas' },
  { id: 10, estado_id: 9, nombre: 'Angostura del Orinoco' },
  { id: 11, estado_id: 10, nombre: 'Valencia' },
  { id: 12, estado_id: 11, nombre: 'Ezequiel Zamora' },
  { id: 13, estado_id: 12, nombre: 'Tucupita' },
  { id: 14, estado_id: 13, nombre: 'Libertador' },
  { id: 15, estado_id: 14, nombre: 'Juan Germán Roscio' },
  { id: 16, estado_id: 15, nombre: 'Libertador' },
  { id: 17, estado_id: 16, nombre: 'Guaicaipuro' },
  { id: 18, estado_id: 17, nombre: 'Maturín' },
  { id: 19, estado_id: 18, nombre: 'Arismendi' },
  { id: 20, estado_id: 19, nombre: 'Guanare' },
  { id: 21, estado_id: 20, nombre: 'Sucre' },
  { id: 22, estado_id: 21, nombre: 'San Cristóbal' },
  { id: 23, estado_id: 22, nombre: 'Trujillo' },
  { id: 24, estado_id: 23, nombre: 'Vargas' },
  { id: 25, estado_id: 24, nombre: 'San Felipe' },
  { id: 26, estado_id: 25, nombre: 'Dependencias Federales' }
];

const parroquias = [
  { id: 1, municipio_id: 1, nombre: 'Olegario Villalobos' },
  { id: 2, municipio_id: 1, nombre: 'Juana de Ávila' },
  { id: 3, municipio_id: 2, nombre: 'San Francisco' },
  { id: 4, municipio_id: 3, nombre: 'Catedral' },
  { id: 5, municipio_id: 4, nombre: 'Santa Ana' },
  { id: 6, municipio_id: 5, nombre: 'Fernando Girón Tovar' },
  { id: 7, municipio_id: 6, nombre: 'El Carmen' },
  { id: 8, municipio_id: 7, nombre: 'San Fernando' },
  { id: 9, municipio_id: 8, nombre: 'Joaquín Crespo' },
  { id: 10, municipio_id: 9, nombre: 'Barinas' },
  { id: 11, municipio_id: 10, nombre: 'Catedral' },
  { id: 12, municipio_id: 11, nombre: 'San José' },
  { id: 13, municipio_id: 12, nombre: 'San Carlos' },
  { id: 14, municipio_id: 13, nombre: 'José Vidal Marcano' },
  { id: 15, municipio_id: 14, nombre: 'Catedral' },
  { id: 16, municipio_id: 15, nombre: 'San Juan de los Morros' },
  { id: 17, municipio_id: 16, nombre: 'Milla' },
  { id: 18, municipio_id: 17, nombre: 'Los Teques' },
  { id: 19, municipio_id: 18, nombre: 'San Simón' },
  { id: 20, municipio_id: 19, nombre: 'La Asunción' },
  { id: 21, municipio_id: 20, nombre: 'Guanare' },
  { id: 22, municipio_id: 21, nombre: 'Altagracia' },
  { id: 23, municipio_id: 22, nombre: 'San Juan Bautista' },
  { id: 24, municipio_id: 23, nombre: 'Chiquinquirá' },
  { id: 25, municipio_id: 24, nombre: 'La Guaira' },
  { id: 26, municipio_id: 25, nombre: 'San Felipe' },
  { id: 27, municipio_id: 26, nombre: 'Dependencias Federales' }
];

async function seed() {
  console.log("Iniciando la siembra de datos geográficos de Venezuela...");

  try {
    // 1. Insertar Estados
    for (const est of estados) {
      await new Promise((resolve, reject) => {
        conexion.query(
          "INSERT INTO estados (id, nombre, codigo) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), codigo=VALUES(codigo)",
          [est.id, est.nombre, est.codigo],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log("✔ Estados importados correctamente.");

    // 2. Insertar Municipios
    for (const mun of municipios) {
      await new Promise((resolve, reject) => {
        conexion.query(
          "INSERT INTO municipios (id, estado_id, nombre) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE estado_id=VALUES(estado_id), nombre=VALUES(nombre)",
          [mun.id, mun.estado_id, mun.nombre],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log("✔ Municipios importados correctamente.");

    // 3. Insertar Parroquias
    for (const parr of parroquias) {
      await new Promise((resolve, reject) => {
        conexion.query(
          "INSERT INTO parroquias (id, municipio_id, nombre) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE municipio_id=VALUES(municipio_id), nombre=VALUES(nombre)",
          [parr.id, parr.municipio_id, parr.nombre],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log("✔ Parroquias importadas correctamente.");
    console.log("🎉 ¡Proceso de siembra completado con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la siembra de datos:", error);
    console.error("\nConsejo: Asegúrese de que su base de datos MySQL esté iniciada y configurada correctamente en conexion.js.");
    process.exit(1);
  }
}

seed();
