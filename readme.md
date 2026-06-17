## Requisitos

- **Node.js** (v16 o superior recomendado)
- **MySQL Server** (v5.7 o superior / MariaDB)

---

## Instalación y Configuración 

### 1. Clonar e Instalar Dependencias
En la carpeta del proyecto, ejecuta:
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (o un nivel superior, según tu configuración de `conexion.js`) con las credenciales de tu base de datos:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rhierro_db
PORT=3000
```

---

## Configuración de la Base de Datos con XAMPP

Para configurar la base de datos utilizando **XAMPP**, sigue estos pasos:

### 1. Iniciar MySQL desde XAMPP
1. Abre el **XAMPP Control Panel**.
2. Haz clic en el botón **Start** al lado del módulo de **MySQL** (y también de **Apache** para habilitar phpMyAdmin). El indicador de MySQL debe tornarse de color verde.

### 2. Crear la Base de Datos en phpMyAdmin
1. Abre tu navegador web e ingresa a: `http://localhost/phpmyadmin/`.
2. En el menú de la izquierda, haz clic en **Nueva** (o *New*).
3. En el campo "Nombre de la base de datos", escribe exactamente **`rhierro_db`**.
4. Haz clic en el botón **Crear**.

### 3. Ejecutar el Script SQL (Tablas y Datos de Prueba)
1. Selecciona la base de datos **`rhierro_db`** que acabas de crear en el panel izquierdo.
2. Haz clic en la pestaña **SQL** del menú superior.
3. Pega el siguiente script completo y haz clic en el botón **Continuar** (o *Go*) para crear las tablas y poblar las semillas geográficas de prueba:

```sql
-- 1. Crear Base de Datos
CREATE DATABASE IF NOT EXISTS rhierro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rhierro_db;

-- 2. Tablas del Sistema de Control de Hierros (Rhierro 5K)

CREATE TABLE IF NOT EXISTS estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estado_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parroquias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipio_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS productores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    estado_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estado_id) REFERENCES estados(id)
);

CREATE TABLE IF NOT EXISTS fincas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productor_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    superficie DECIMAL(10, 2) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    parroquia VARCHAR(100) NOT NULL,
    sector VARCHAR(255) NOT NULL,
    FOREIGN KEY (productor_id) REFERENCES productores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hierros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productor_id INT NOT NULL,
    marca_nombre VARCHAR(255) NOT NULL,
    hierro_codigo VARCHAR(50) NOT NULL UNIQUE,
    hierro_imagen_url VARCHAR(255) NOT NULL,
    estatus VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productor_id) REFERENCES productores(id) ON DELETE CASCADE
);

-- 3. Tablas Adicionales del Sistema de Gestión

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    precio DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    apellido VARCHAR(60) NOT NULL,
    email VARCHAR(60) NOT NULL,
    login VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL
);

-- 4. Semillas de Datos Geográficos de Prueba (Venezuela Completa)

INSERT INTO estados (id, nombre, codigo) VALUES 
(1, 'Zulia', 'ZUL'),
(2, 'Lara', 'LAR'),
(3, 'Falcón', 'FAL'),
(4, 'Amazonas', 'AMA'),
(5, 'Anzoátegui', 'ANZ'),
(6, 'Apure', 'APU'),
(7, 'Aragua', 'ARA'),
(8, 'Barinas', 'BAR'),
(9, 'Bolívar', 'BOL'),
(10, 'Carabobo', 'CAR'),
(11, 'Cojedes', 'COJ'),
(12, 'Delta Amacuro', 'DEL'),
(13, 'Distrito Capital', 'DCA'),
(14, 'Guárico', 'GUA'),
(15, 'Mérida', 'MER'),
(16, 'Miranda', 'MIR'),
(17, 'Monagas', 'MON'),
(18, 'Nueva Esparta', 'NES'),
(19, 'Portuguesa', 'POR'),
(20, 'Sucre', 'SUC'),
(21, 'Táchira', 'TAC'),
(22, 'Trujillo', 'TRU'),
(23, 'La Guaira', 'LGU'),
(24, 'Yaracuy', 'YAR'),
(25, 'Dependencias Federales', 'DFE')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), codigo=VALUES(codigo);

INSERT INTO municipios (id, estado_id, nombre) VALUES 
(1, 1, 'Maracaibo'),
(2, 1, 'San Francisco'),
(3, 2, 'Iribarren'),
(4, 3, 'Miranda'),
(5, 4, 'Atures'),
(6, 5, 'Simón Bolívar'),
(7, 6, 'San Fernando'),
(8, 7, 'Girardot'),
(9, 8, 'Barinas'),
(10, 9, 'Angostura del Orinoco'),
(11, 10, 'Valencia'),
(12, 11, 'Ezequiel Zamora'),
(13, 12, 'Tucupita'),
(14, 13, 'Libertador'),
(15, 14, 'Juan Germán Roscio'),
(16, 15, 'Libertador'),
(17, 16, 'Guaicaipuro'),
(18, 17, 'Maturín'),
(19, 18, 'Arismendi'),
(20, 19, 'Guanare'),
(21, 20, 'Sucre'),
(22, 21, 'San Cristóbal'),
(23, 22, 'Trujillo'),
(24, 23, 'Vargas'),
(25, 24, 'San Felipe'),
(26, 25, 'Dependencias Federales')
ON DUPLICATE KEY UPDATE estado_id=VALUES(estado_id), nombre=VALUES(nombre);

INSERT INTO parroquias (id, municipio_id, nombre) VALUES 
(1, 1, 'Olegario Villalobos'),
(2, 1, 'Juana de Ávila'),
(3, 2, 'San Francisco'),
(4, 3, 'Catedral'),
(5, 4, 'Santa Ana'),
(6, 5, 'Fernando Girón Tovar'),
(7, 6, 'El Carmen'),
(8, 7, 'San Fernando'),
(9, 8, 'Joaquín Crespo'),
(10, 9, 'Barinas'),
(11, 10, 'Catedral'),
(12, 11, 'San José'),
(13, 12, 'San Carlos'),
(14, 13, 'José Vidal Marcano'),
(15, 14, 'Catedral'),
(16, 15, 'San Juan de los Morros'),
(17, 16, 'Milla'),
(18, 17, 'Los Teques'),
(19, 18, 'San Simón'),
(20, 19, 'La Asunción'),
(21, 20, 'Guanare'),
(22, 21, 'Altagracia'),
(23, 22, 'San Juan Bautista'),
(24, 23, 'Chiquinquirá'),
(25, 24, 'La Guaira'),
(26, 25, 'San Felipe'),
(27, 26, 'Dependencias Federales')
ON DUPLICATE KEY UPDATE municipio_id=VALUES(municipio_id), nombre=VALUES(nombre);
```

---

## 🚀 Ejecución del Servidor

Para iniciar la aplicación en modo desarrollo/depuración:
```bash
set debug=crud-mysql:* & npm start
```

Para iniciar la aplicación de forma normal:
```bash
npm start
```

Una vez levantado el servidor, abre tu navegador e ingresa a:
- **Dashboard y Registro de Hierros**: `http://localhost:3000/`
- **Módulo de Gestión de Productos**: `http://localhost:3000/productos`
