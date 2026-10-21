const express = require('express');
const router = express.Router();

const productoController = require('../../controllers/Producto.controller');
const { verificarToken, verificarAdmin, identificarUsuario } = require('../../middlewares/Autorizacion.middlewares');

// GET  /api/productos            -> lista con filtros opcionales (?busqueda=&categoriaId=&sinGluten=&destacado=)
// Publica. Sin token de admin, solo devuelve los activos (ver controller).
router.get('/', identificarUsuario, productoController.obtenerTodos);

// GET  /api/productos/:id        -> un producto por id (con su categoria y sus imagenes)
// Publica. Sin token de admin, un producto dado de baja da 404.
router.get('/:id', identificarUsuario, productoController.obtenerPorId);

// POST /api/productos            -> crea un producto (datos.imagenes opcional: array de URLs)
router.post('/', verificarToken, verificarAdmin, productoController.crear);

// PUT  /api/productos/:id        -> edita los datos basicos de un producto
router.put('/:id', verificarToken, verificarAdmin, productoController.editar);

// DELETE /api/productos/:id      -> borra un producto (y sus imagenes)
router.delete('/:id', verificarToken, verificarAdmin, productoController.eliminar);

// POST   /api/productos/:productoId/imagenes            -> agrega una o varias imagenes al producto (body: { url } o { urls: [...] })
router.post('/:productoId/imagenes', verificarToken, verificarAdmin, productoController.agregarImagen);

// DELETE /api/productos/:productoId/imagenes             -> borra una o varias imagenes 
// (body: { imagenId } o { imagenesIds: [...] })
router.delete('/:productoId/imagenes', verificarToken, verificarAdmin, productoController.eliminarImagen);

// PUT    /api/productos/:productoId/imagenes/orden      -> reordena las imagenes (drag and drop)
router.put('/:productoId/imagenes/orden', verificarToken, verificarAdmin, productoController.reordenarImagenes);

module.exports = router;