const express = require('express');
const router = express.Router();

// Router principal de la API. Junta las rutas de cada entidad.
// A medida que agreguemos entidades (productos, categorias...),
// se van sumando lineas router.use(...) aca.

const usuarioRoutes = require('./api/Usuario.routes');
const categoriaRoutes = require('./api/Categoria.routes');

// Todo lo que empiece con /usuarios lo maneja usuarioRoutes.
// Combinado con el prefijo /api de app.js, queda /api/usuarios/...
router.use('/usuarios', usuarioRoutes);

// Todo lo que empiece con /categorias lo maneja categoriaRoutes.
router.use('/categorias', categoriaRoutes);

module.exports = router;