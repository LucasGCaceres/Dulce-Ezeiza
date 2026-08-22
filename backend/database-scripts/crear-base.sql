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
    fecha DATETIME
);
GO