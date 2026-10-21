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
-- COLLATE Modern_Spanish_CI_AI: CI = no distingue mayusculas, AI = no
-- distingue tildes. Asi el buscador encuentra "Francés" escribiendo
-- "frances". Lo heredan todas las columnas de texto de la base.
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DulceEzeiza')
BEGIN
    CREATE DATABASE DulceEzeiza COLLATE Modern_Spanish_CI_AI;
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
    rol NVARCHAR(20) NOT NULL,
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
    fecha DATETIME DEFAULT GETDATE()
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

-- ------------------------------------------------------------
--  Tabla: ConsultaProductos (relacion N..N Consulta - Producto)
--  Cada fila dice "esta consulta menciona este producto".
--  La PK compuesta impide repetir un producto en la misma consulta.
-- ------------------------------------------------------------
CREATE TABLE ConsultaProductos (
    consultaId INT NOT NULL,
    productoId INT NOT NULL,
    CONSTRAINT PK_ConsultaProductos PRIMARY KEY (consultaId, productoId),
    CONSTRAINT FK_ConsultaProductos_Consultas FOREIGN KEY (consultaId)
        REFERENCES Consultas(id),
    CONSTRAINT FK_ConsultaProductos_Productos FOREIGN KEY (productoId)
        REFERENCES Productos(id)
);

GO

-- Fila unica con datos de ejemplo. El admin los reemplaza despues desde el panel.
-- Las redes van en NULL: el front muestra cada una solo si tiene valor.
INSERT INTO Comercio (nombre, descripcion, direccion, telefono, instagram, facebook, whatsapp, tiktok, horarios)
VALUES (
    N'Dulce Ezeiza',
    N'Panadería y pastelería artesanal.',
    N'Av. Pedro Dreyer 1450, Ezeiza',
    N'(011) 4295-1847',
    NULL,
    NULL,
    NULL,
    NULL,
    N'Lunes a sábado de 7 a 20:30. Domingos y feriados de 7:30 a 13.'
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

-- ------------------------------------------------------------
--  Tabla: Novedades (noticias y anuncios del local)
--  Se crean como borrador (publicada = 0). El publico solo ve las
--  publicadas con fechaPublicacion ya cumplida.
--  ON DELETE SET NULL: si se borra el producto mencionado, la novedad
--  queda sin producto en vez de bloquear el borrado.
-- ------------------------------------------------------------
CREATE TABLE Novedades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    titulo NVARCHAR(150) NOT NULL,
    resumen NVARCHAR(300) NOT NULL,            -- lo que se ve en las tarjetas
    contenido NVARCHAR(MAX) NOT NULL,          -- texto completo del detalle
    imagenUrl NVARCHAR(500) NULL,              -- una sola imagen, como URL
    fechaPublicacion DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    publicada BIT NOT NULL DEFAULT 0,
    productoId INT NULL,                       -- producto relacionado, opcional
    CONSTRAINT FK_Novedades_Productos FOREIGN KEY (productoId)
        REFERENCES Productos(id) ON DELETE SET NULL
);
GO

-- ------------------------------------------------------------
--  Mapea el login de la app como usuario de esta base, con
--  permisos de db_owner.
-- ------------------------------------------------------------
BEGIN TRY
    CREATE USER dulce_user FOR LOGIN dulce_user;
    ALTER ROLE db_owner ADD MEMBER dulce_user;
    PRINT 'OK: dulce_user mapeado como db_owner de DulceEzeiza.';
END TRY
BEGIN CATCH
    PRINT 'AVISO: no se pudo mapear el login "dulce_user" (revisa si tu login se llama distinto -- ver DB_USER en tu .env). Error: ' + ERROR_MESSAGE();
    PRINT 'Hacelo a mano: SSMS > Security > Logins > <tu login> > Properties > User Mapping > tildar DulceEzeiza > tildar db_owner.';
END CATCH
GO

-- ============================================================
--  SEED: categorias + 20 productos + 3 usuarios ficticios
--  Pegar y ejecutar esto en SSMS, sobre la base DulceEzeiza ya
--  existente. Ejecutar UNA sola vez (no es idempotente: si lo
--  corres dos veces, vas a tener categorias y productos duplicados).
-- ============================================================

-- ------------------------------------------------------------
--  Las passwords estan hasheadas con bcrypt (costo 8, igual que
--  usa el backend). En texto plano son:
--    admin@dulceezeiza.com        -> Admin123!
-- ------------------------------------------------------------
INSERT INTO Usuarios (nombre, apellido, email, telefono, password, rol) VALUES
('Admin', 'Dulce Ezeiza', 'admin@dulceezeiza.com', '1122334455', '$2b$08$a4Y3ECUAhZuT5Cw/B6mEqe726/hixNeWY.t90dSRRjmajWaV0AMmS', 'admin');
GO
-- ------------------------------------------------------------
--  Categorias
-- ------------------------------------------------------------
INSERT INTO Categorias (nombre, descripcion, activa) VALUES
(N'Panadería', N'Panes de todos los días.', 1),
(N'Facturas y Bollería', N'Facturas dulces y saladas para la mañana o la merienda.', 1),
(N'Tortas y Tartas', N'Tortas enteras y tartas dulces, por porción o para llevar.', 1),
(N'Pastelería individual', N'Piezas individuales: alfajores, brownies, cupcakes y más.', 1),
(N'Sin gluten', N'Productos aptos para celíacos.', 1),
(N'Bebidas', N'Café, té y bebidas para acompañar.', 1);
GO
 
-- ------------------------------------------------------------
--  Productos (20 en total, distribuidos en las 6 categorias)
--  categoriaId se resuelve por subquery sobre el nombre de la
--  categoria, para no depender de que los ids salgan 1..6.
-- ------------------------------------------------------------
 
-- Panaderia
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
(N'Pan Francés', N'Pan francés clásico, horneado todos los días.', 1200.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Panadería')),
(N'Pan de Campo', N'Pan de campo de miga tierna y corteza crocante.', 2200.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Panadería')),
(N'Pan Lactal', N'Pan lactal casero, ideal para sándwiches.', 2600.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Panadería')),
(N'Pan de Salvado', N'Pan de salvado, alto en fibra.', 2400.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Panadería'));
 
-- Facturas y Bolleria
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
(N'Medialunas de Manteca', N'Docena de medialunas de manteca, bien dulces.', 3800.00, 1, 1, 1, 0, (SELECT id FROM Categorias WHERE nombre = N'Facturas y Bollería')),
(N'Medialunas de Grasa', N'Docena de medialunas de grasa, estilo tradicional.', 3200.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Facturas y Bollería')),
(N'Vigilantes', N'Factura rellena de dulce de batata.', 900.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Facturas y Bollería')),
(N'Sacramentos', N'Factura hojaldrada rellena de crema pastelera.', 950.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Facturas y Bollería'));
 
-- Tortas y Tartas
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
(N'Torta de Chocolate', N'Torta de chocolate con ganache, porción individual.', 3500.00, 1, 1, 1, 0, (SELECT id FROM Categorias WHERE nombre = N'Tortas y Tartas')),
(N'Torta Selva Negra', N'Bizcochuelo de chocolate, crema y cerezas.', 4200.00, 0, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Tortas y Tartas')),
(N'Tarta de Manzana', N'Tarta de manzana con masa sablée, porción individual.', 2800.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Tortas y Tartas')),
(N'Cheesecake de Frutos Rojos', N'Cheesecake horneado con coulis de frutos rojos.', 3900.00, 1, 1, 1, 0, (SELECT id FROM Categorias WHERE nombre = N'Tortas y Tartas'));
 
-- Pasteleria individual
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
(N'Alfajor de Maicena', N'Dos tapas de maicena rellenas de dulce de leche.', 1100.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Pastelería individual')),
(N'Lemon Pie Individual', N'Porción individual de lemon pie con merengue.', 1900.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Pastelería individual')),
(N'Brownie', N'Brownie de chocolate con nueces.', 1500.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Pastelería individual')),
(N'Cupcake de Vainilla', N'Cupcake de vainilla con frosting de manteca.', 1300.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Pastelería individual'));
 
-- Sin gluten
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
(N'Pan Sin Gluten', N'Pan apto celíacos, elaborado en zona libre de contaminación cruzada.', 3200.00, 1, 1, 0, 1, (SELECT id FROM Categorias WHERE nombre = N'Sin gluten')),
(N'Torta Sin Gluten de Naranja', N'Torta de naranja apta celíacos.', 4500.00, 1, 1, 1, 1, (SELECT id FROM Categorias WHERE nombre = N'Sin gluten'));
 
-- Bebidas
INSERT INTO Productos (nombre, descripcion, precio, disponible, activo, destacado, sinGluten, categoriaId) VALUES
(N'Café en Grano 500g', N'Café de especialidad en grano, bolsa de 500g.', 6500.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Bebidas')),
(N'Limonada Casera 1L', N'Limonada casera con menta, botella de 1 litro.', 2100.00, 1, 1, 0, 0, (SELECT id FROM Categorias WHERE nombre = N'Bebidas'));
GO

-- ------------------------------------------------------------
--  Consultas de ejemplo (una en cada estado, para probar el panel
--  y sus filtros). Las mandan visitantes sin cuenta: los datos de
--  contacto van sueltos en la consulta.
--  Va al final porque una consulta apunta a un producto, y la FK
--  exige que ese producto ya exista.
-- ------------------------------------------------------------
INSERT INTO Consultas (nombre, email, telefono, asunto, mensaje, estado) VALUES
(N'María González', N'maria.gonzalez@ejemplo.com', N'1133445566', N'Torta para cumpleaños', N'¿Hacen tortas por encargo para 20 personas?', N'pendiente'),
(N'Juan Pérez', N'juan.perez@ejemplo.com', NULL, N'Consulta sin TACC', N'¿El pan y la torta sin gluten se elaboran en un espacio separado?', N'respondida'),
(N'Sofía Martínez', N'sofia.martinez@ejemplo.com', N'1155667788', N'Horarios', N'¿Abren los domingos?', N'cerrada');
GO

-- La consulta de Juan menciona dos productos sin TACC.
INSERT INTO ConsultaProductos (consultaId, productoId)
SELECT c.id, p.id
FROM Consultas c, Productos p
WHERE c.email = 'juan.perez@ejemplo.com'
  AND p.nombre IN (N'Pan Sin Gluten', N'Torta Sin Gluten de Naranja');
GO

-- ------------------------------------------------------------
--  Novedades de ejemplo (las 5 del diseño, todas publicadas).
--  Las fechas son relativas a HOY (DATEADD sobre SYSDATETIME), asi
--  siempre quedan en el pasado y se ven, corras el script cuando corras.
--  productoId por subquery sobre el nombre, igual que en Productos.
-- ------------------------------------------------------------
INSERT INTO Novedades (titulo, resumen, contenido, imagenUrl, fechaPublicacion, publicada, productoId) VALUES
(N'¡Cumplimos 10 años!',
 N'Una década horneando para Ezeiza. Lo festejamos con descuentos toda la semana.',
 N'Hace diez años abrimos las puertas de Dulce Ezeiza con un horno y muchas ganas. Para agradecerles, esta semana tenemos sorpresas en el local: pasá a conocerlas.',
 NULL, DATEADD(DAY, -2, SYSDATETIME()), 1, NULL),
(N'Día de la Madre',
 N'Tortas y cajas de regalo por encargo para el día de mamá.',
 N'Se acerca el Día de la Madre y preparamos tortas, cajas de regalo y desayunos para sorprender a mamá. Hacé tu pedido con anticipación desde el formulario de contacto.',
 NULL, DATEADD(DAY, -6, SYSDATETIME()), 1, NULL),
(N'Nueva torta sin TACC',
 N'Sumamos la torta de naranja apta celíacos, elaborada en zona separada.',
 N'Nuestra torta de naranja sin TACC se elabora en un espacio libre de contaminación cruzada. Pensada para que nadie se quede sin postre.',
 NULL, DATEADD(DAY, -12, SYSDATETIME()), 1, (SELECT id FROM Productos WHERE nombre = N'Torta Sin Gluten de Naranja')),
(N'Ahora abrimos los domingos',
 N'Domingos y feriados de 7:30 a 13, con facturas recién hechas.',
 N'A pedido de ustedes, ahora abrimos domingos y feriados de 7:30 a 13. Medialunas, facturas y pan recién salidos del horno para el desayuno del fin de semana.',
 NULL, DATEADD(DAY, -20, SYSDATETIME()), 1, NULL),
(N'Café de especialidad',
 N'Llegó nuestro café en grano de especialidad, para llevar a casa.',
 N'Ahora podés llevarte a casa el mismo café que servimos en el local: café de especialidad en grano, en bolsa de 500g.',
 NULL, DATEADD(DAY, -30, SYSDATETIME()), 1, (SELECT id FROM Productos WHERE nombre = N'Café en Grano 500g'));
GO


/* Para hacer los cambios en la bd sin borrarla 
USE DulceEzeiza;
GO
CREATE TABLE ConsultaProductos (
    consultaId INT NOT NULL,
    productoId INT NOT NULL,
    CONSTRAINT PK_ConsultaProductos PRIMARY KEY (consultaId, productoId),
    CONSTRAINT FK_ConsultaProductos_Consultas FOREIGN KEY (consultaId) REFERENCES Consultas(id),
    CONSTRAINT FK_ConsultaProductos_Productos FOREIGN KEY (productoId) REFERENCES Productos(id)
);
GO
INSERT INTO ConsultaProductos (consultaId, productoId)
SELECT id, productoId FROM Consultas WHERE productoId IS NOT NULL;
GO
ALTER TABLE Consultas DROP CONSTRAINT FK_Consultas_Productos;
ALTER TABLE Consultas DROP COLUMN productoId;
GO

*/