-- ============================================================
--  CARGAR IMAGENES (PRODUCTOS Y NOVEDADES) - DULCE EZEIZA
-- ============================================================
--  Correr DESPUES de crear-base.sql. Le pone a cada uno de los 20
--  productos las imagenes que estan en frontend/public/img/productos
--  (el sitio las sirve como /img/productos/<archivo>.svg) y a cada una
--  de las 5 novedades de ejemplo su imagen (/img/productos o /img/sitio).
--
--  Se puede correr mas de una vez: primero deja la tabla limpia.
-- ============================================================

USE DulceEzeiza;
GO

DELETE FROM ImagenesProducto;
GO

-- orden 0 = la portada (la que se ve en el catalogo)
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/pan-frances.svg', 0 FROM Productos WHERE nombre = N'Pan Francés';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/pan-de-campo.svg', 0 FROM Productos WHERE nombre = N'Pan de Campo';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/pan-lactal.svg', 0 FROM Productos WHERE nombre = N'Pan Lactal';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/pan-de-salvado.svg', 0 FROM Productos WHERE nombre = N'Pan de Salvado';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/medialunas-de-manteca.svg', 0 FROM Productos WHERE nombre = N'Medialunas de Manteca';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/medialunas-de-manteca-2.svg', 1 FROM Productos WHERE nombre = N'Medialunas de Manteca';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/medialunas-de-grasa.svg', 0 FROM Productos WHERE nombre = N'Medialunas de Grasa';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/vigilantes.svg', 0 FROM Productos WHERE nombre = N'Vigilantes';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/sacramentos.svg', 0 FROM Productos WHERE nombre = N'Sacramentos';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/torta-de-chocolate.svg', 0 FROM Productos WHERE nombre = N'Torta de Chocolate';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/torta-selva-negra.svg', 0 FROM Productos WHERE nombre = N'Torta Selva Negra';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/tarta-de-manzana.svg', 0 FROM Productos WHERE nombre = N'Tarta de Manzana';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/cheesecake-de-frutos-rojos.svg', 0 FROM Productos WHERE nombre = N'Cheesecake de Frutos Rojos';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/alfajor-de-maicena.svg', 0 FROM Productos WHERE nombre = N'Alfajor de Maicena';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/lemon-pie-individual.svg', 0 FROM Productos WHERE nombre = N'Lemon Pie Individual';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/brownie.svg', 0 FROM Productos WHERE nombre = N'Brownie';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/cupcake-de-vainilla.svg', 0 FROM Productos WHERE nombre = N'Cupcake de Vainilla';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/pan-sin-gluten.svg', 0 FROM Productos WHERE nombre = N'Pan Sin Gluten';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/torta-sin-gluten-de-naranja.svg', 0 FROM Productos WHERE nombre = N'Torta Sin Gluten de Naranja';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/cafe-en-grano.svg', 0 FROM Productos WHERE nombre = N'Café en Grano 500g';
INSERT INTO ImagenesProducto (productoId, url, orden) SELECT id, N'/img/productos/limonada-casera.svg', 0 FROM Productos WHERE nombre = N'Limonada Casera 1L';
GO

-- ------------------------------------------------------------
--  Imagenes de las novedades de ejemplo (se buscan por titulo).
-- ------------------------------------------------------------
UPDATE Novedades SET imagenUrl = N'/img/sitio/torta-de-cumple.svg' WHERE titulo = N'¡Cumplimos 10 años!';
UPDATE Novedades SET imagenUrl = N'/img/productos/torta-de-chocolate.svg' WHERE titulo = N'Día de la Madre';
UPDATE Novedades SET imagenUrl = N'/img/productos/torta-sin-gluten-de-naranja.svg' WHERE titulo = N'Nueva torta sin TACC';
UPDATE Novedades SET imagenUrl = N'/img/productos/medialunas-de-manteca.svg' WHERE titulo = N'Ahora abrimos los domingos';
UPDATE Novedades SET imagenUrl = N'/img/productos/cafe-en-grano.svg' WHERE titulo = N'Café de especialidad';
GO

-- Chequeo: tiene que dar 21 imagenes repartidas en 20 productos.
SELECT COUNT(*) AS imagenes, COUNT(DISTINCT productoId) AS productos FROM ImagenesProducto;
GO

-- Chequeo: tiene que dar 5 novedades con imagen.
SELECT COUNT(*) AS novedades_con_imagen FROM Novedades WHERE imagenUrl IS NOT NULL;
GO