const mysql = require("mysql");
const path = require("path");

// Leomar: Cargar variables de entorno del archivo .env del proyecto principal.
// Reniel: Modificado el path para subir un nivel (..) y encontrar el .env del repo.
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "rhierro_db",
  charset: "utf8mb4"
});