const express = require('express');
const router = express.Router();

const categoriaController = require('../../controllers/Categoria.controller');

// Cada linea conecta un VERBO + RUTA con una funcion del controller.

// GET  /api/categorias        -> lista todas las categorias
router.get('/', categoriaController.obtenerTodas);

// GET  /api/categorias/:id    -> trae una categoria por su id
// El :id es un "comodin": lo que venga ahi queda en req.params.id
router.get('/:id', categoriaController.obtenerPorId);

// POST /api/categorias        -> crea una categoria nueva
router.post('/', categoriaController.crear);

// PUT  /api/categorias/:id    -> edita la categoria con ese id
router.put('/:id', categoriaController.editar);

// DELETE /api/categorias/:id  -> borra la categoria con ese id
router.delete('/:id', categoriaController.eliminar);

module.exports = router;