const express = require('express');
const router = express.Router();

const productoController = require('../../controllers/Producto.controller');
const verificarToken = require('../../middlewares/Autorizacion.middlewares');

// GET  /api/productos            -> lista con filtros opcionales (?busqueda=&categoriaId=&sinGluten=)
router.get('/', productoController.obtenerTodos);

// GET  /api/productos/:id        -> un producto por id (con su categoria)
router.get('/:id', productoController.obtenerPorId);

// POST /api/productos            -> crea un producto
router.post('/', verificarToken, productoController.crear);

// PUT  /api/productos/:id        -> edita un producto
router.put('/:id', verificarToken, productoController.editar);

// DELETE /api/productos/:id      -> borra un producto
router.delete('/:id', verificarToken, productoController.eliminar);

module.exports = router;