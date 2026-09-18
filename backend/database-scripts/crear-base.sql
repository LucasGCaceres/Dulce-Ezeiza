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
    rol NVARCHAR(20) NOT NULL DEFAULT 'cliente',
    resetPasswordToken NVARCHAR(255),      -- token temporal para recuperar la contraseña
    resetPasswordExpira DATETIME2           -- vencimiento del token (15 min despues de generarlo)
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
    usuarioId INT NOT NULL,
    productoId INT NULL,
    fecha DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Consultas_Usuarios FOREIGN KEY (usuarioId)
        REFERENCES Usuarios(id),
    CONSTRAINT FK_Consultas_Productos FOREIGN KEY (productoId)
        REFERENCES Productos(id)
);

GO

-- ------------------------------------------------------------
--  Tabla: Comercio (informacion institucional del negocio)
-- ------------------------------------------------------------
CREATE TABLE Comercio (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    descripcion NVARCHAR(1000),
    direccion NVARCHAR(300),
    telefono NVARCHAR(50),
    instagram NVARCHAR(150),
    facebook NVARCHAR(150),
    whatsapp NVARCHAR(50),
    tiktok NVARCHAR(150),
    horarios NVARCHAR(500)
);
GO

-- Fila unica con datos de ejemplo. El admin los reemplaza despues desde el panel.
INSERT INTO Comercio (nombre, descripcion, direccion, telefono, instagram, facebook, whatsapp, tiktok, horarios)
VALUES (
    'Dulce Ezeiza',
    'Panaderia y pasteleria artesanal.',
    'Completar direccion',
    'Completar telefono',
    NULL,
    NULL,
    NULL,
    NULL,
    'Completar horarios de atencion'
);
GO

GO

-- ------------------------------------------------------------
--  Tabla: ImagenesProducto (fotos de cada producto, en el orden que se muestran)
-- ------------------------------------------------------------
CREATE TABLE ImagenesProducto (
    id INT IDENTITY(1,1) PRIMARY KEY,
    productoId INT NOT NULL,
    url NVARCHAR(500) NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_ImagenesProducto_Productos FOREIGN KEY (productoId)
        REFERENCES Productos(id)
);
GO


-- ============================================================
--  SEED: categorias + 20 productos + 3 usuarios ficticios
--  Pegar y ejecutar esto en SSMS, sobre la base DulceEzeiza ya
--  existente. Ejecutar UNA sola vez (no es idempotente: si lo
--  corres dos veces, vas a tener categorias y productos duplicados).
-- ============================================================

-- ------------------------------------------------------------
--  Usuarios ficticios (para no tener que registrarte/crear el
--  admin a mano antes de poder probar nada).
--
--  Las passwords estan hasheadas con bcrypt (costo 8, igual que
--  usa el backend). En texto plano son:
--    admin@dulceezeiza.com        -> Admin123!
--    maria.gonzalez@ejemplo.com   -> Cliente123!
--    juan.perez@ejemplo.com       -> Cliente123!
--    sofia.martinez@ejemplo.com   -> Cliente123!
-- ------------------------------------------------------------
INSERT INTO Usuarios (nombre, apellido, email, telefono, password, rol) VALUES
('Admin', 'Dulce Ezeiza', 'admin@dulceezeiza.com', '1122334455', '$2b$08$a4Y3ECUAhZuT5Cw/B6mEqe726/hixNeWY.t90dSRRjmajWaV0AMmS', 'admin'),
('Maria', 'Gonzalez', 'maria.gonzalez@ejemplo.com', '1133445566', '$2b$08$ki6OdO6LHtTCJ1S/jUiAv.jcruJxcZWIdfu5B5EZdfkv90sP8R3uG', 'cliente'),
('Juan', 'Perez', 'juan.perez@ejemplo.com', '1144556677', '$2b$08$ki6OdO6LHtTCJ1S/jUiAv.jcruJxcZWIdfu5B5EZdfkv90sP8R3uG', 'cliente'),
('Sofia', 'Martinez', 'sofia.martinez@ejemplo.com', '1155667788', '$2b$08$5dZbFNs65.MfICrphnVGW.Txap8Vrhuei4Az8Go2jF0bAUS5NxEGG', 'cliente');
GO
-- ------------------------------------------------------------
--  Categorias
-- ------------------------------------------------------------
INSERT INTO Categorias (nombre, descripcion, activa) VALUES
('Panaderia', 'Panes de todos los dias.', 1),
('Facturas y Bolleria', 'Facturas dulces y saladas para la mañana o la merienda.', 1),
('Tortas y Tartas', 'Tortas enteras y tartas dulces, por porcion o para llevar.', 1),
('Pasteleria individual', 'Piezas individuales: alfajores, brownies, cupcakes y mas.', 1),
('Sin gluten', 'Productos aptos para celiacos.', 1),
('Bebidas', 'Cafe, te y bebidas para acompañar.', 1);
GO
 
-- ------------------------------------------------------------
--  Productos (20 en total, distribuidos en las 6 categorias)
--  categoriaId se resuelve por subquery sobre el nombre de la
--  categoria, para no depender de que los ids salgan 1..6.
-- ------------------------------------------------------------
 
-- Panaderia
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
('Pan Frances', 'Pan frances clasico, horneado todos los dias.', 1200.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Panaderia')),
('Pan de Campo', 'Pan de campo de miga tierna y corteza crocante.', 2200.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Panaderia')),
('Pan Lactal', 'Pan lactal casero, ideal para sandwiches.', 2600.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Panaderia')),
('Pan de Salvado', 'Pan de salvado, alto en fibra.', 2400.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Panaderia'));
 
-- Facturas y Bolleria
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
('Medialunas de Manteca', 'Docena de medialunas de manteca, bien dulces.', 3800.00, 1, 1, 1, 0, (SELECT id FROM Categorias WHERE nombre = 'Facturas y Bolleria')),
('Medialunas de Grasa', 'Docena de medialunas de grasa, estilo tradicional.', 3200.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Facturas y Bolleria')),
('Vigilantes', 'Factura rellena de dulce de batata.', 900.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Facturas y Bolleria')),
('Sacramentos', 'Factura hojaldrada rellena de crema pastelera.', 950.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Facturas y Bolleria'));
 
-- Tortas y Tartas
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
('Torta de Chocolate', 'Torta de chocolate con ganache, porcion individual.', 3500.00, 1, 1, 1, 0, (SELECT id FROM Categorias WHERE nombre = 'Tortas y Tartas')),
('Torta Selva Negra', 'Bizcochuelo de chocolate, crema y cerezas.', 4200.00, 0, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Tortas y Tartas')),
('Tarta de Manzana', 'Tarta de manzana con masa sable, porcion individual.', 2800.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Tortas y Tartas')),
('Cheesecake de Frutos Rojos', 'Cheesecake horneado con coulis de frutos rojos.', 3900.00, 1, 1, 1, 0, (SELECT id FROM Categorias WHERE nombre = 'Tortas y Tartas'));
 
-- Pasteleria individual
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
('Alfajor de Maicena', 'Dos tapas de maicena rellenas de dulce de leche.', 1100.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Pasteleria individual')),
('Lemon Pie Individual', 'Porcion individual de lemon pie con merengue.', 1900.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Pasteleria individual')),
('Brownie', 'Brownie de chocolate con nueces.', 1500.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Pasteleria individual')),
('Cupcake de Vainilla', 'Cupcake de vainilla con frosting de manteca.', 1300.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Pasteleria individual'));
 
-- Sin gluten
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
('Pan Sin Gluten', 'Pan apto celiacos, elaborado en zona libre de contaminacion cruzada.', 3200.00, 1, 1, 0, 1, (SELECT id FROM Categorias WHERE nombre = 'Sin gluten')),
('Torta Sin Gluten de Naranja', 'Torta de naranja apta celiacos.', 4500.00, 1, 1, 1, 1, (SELECT id FROM Categorias WHERE nombre = 'Sin gluten'));
 
-- Bebidas
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
('Cafe en Grano 500g', 'Cafe de especialidad en grano, bolsa de 500g.', 6500.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Bebidas')),
('Limonada Casera 1L', 'Limonada casera con menta, botella de 1 litro.', 2100.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = 'Bebidas'));
GO
 