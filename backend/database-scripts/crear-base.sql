-- ============================================================
--  SCRIPT DE CREACION DE BASE DE DATOS - DULCE EZEIZA
-- ============================================================
--  Como usarlo:
--   1. En SQL Server Management Studio, crear la base DulceEzeiza
--      (o dejar que la cree la primera linea de abajo).
--   2. Abrir una New Query sobre esa base.
--   3. Pegar este script y ejecutar (F5).
--
--  Este script se ira completando con el resto de las tablas
--  (Categorias, Productos, etc.) a medida que avance el proyecto.
-- ============================================================

-- Crea la base solo si no existe todavia.
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DulceEzeiza')
BEGIN
    CREATE DATABASE DulceEzeiza;
END
GO

USE DulceEzeiza;
GO

-- ------------------------------------------------------------
--  Tabla: Usuarios (administrador del comercio)
-- ------------------------------------------------------------
CREATE TABLE Usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,   -- no se permiten emails duplicados
    telefono NVARCHAR(50),                 -- opcional
    password NVARCHAR(255) NOT NULL,       -- se guarda el hash de bcrypt
    fecha DATETIME DEFAULT GETDATE(),
    rol NVARCHAR(20) NOT NULL DEFAULT 'cliente'
);
GO

-- ------------------------------------------------------------
--  Tabla: Categorias (rubros del catalogo)
-- ------------------------------------------------------------
CREATE TABLE Categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL UNIQUE,      -- no se permiten nombres repetidos
    descripcion NVARCHAR(500),                 -- opcional
    activa BIT NOT NULL DEFAULT 1,             -- 1 = activa, 0 = inactiva
    fecha DATETIME DEFAULT GETDATE()
);
GO

-- ------------------------------------------------------------
--  Tabla: Productos (articulos del catalogo)
-- ------------------------------------------------------------
CREATE TABLE Productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    descripcion NVARCHAR(1000),
    precio DECIMAL(10,2) NOT NULL,
    disponible BIT NOT NULL DEFAULT 1,
    activo BIT NOT NULL DEFAULT 1,
    destacado BIT NOT NULL DEFAULT 0,
    sinGluten BIT NOT NULL DEFAULT 0,
    categoriaId INT NOT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Productos_Categorias FOREIGN KEY (categoriaId)
        REFERENCES Categorias(id)
);
GO

-- ------------------------------------------------------------
--  Tabla: Consultas (mensajes de contacto de los clientes)
-- ------------------------------------------------------------
CREATE TABLE Consultas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    telefono NVARCHAR(50),
    asunto NVARCHAR(200) NOT NULL,
    mensaje NVARCHAR(2000) NOT NULL,
    estado NVARCHAR(20) NOT NULL DEFAULT 'pendiente',
    productoId INT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Consultas_Productos FOREIGN KEY (productoId)
        REFERENCES Productos(id)
);