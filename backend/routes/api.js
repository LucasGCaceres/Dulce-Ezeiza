const express = require('express');
const router = express.Router();

// Router principal de la API. Junta las rutas de cada entidad.
// A medida que agreguemos entidades (productos, categorias...),
// se van sumando lineas router.use(...) aca.

const usuarioRoutes = require('./api/usuario.routes');

// Todo lo que empiece con /usuarios lo maneja usuarioRoutes.
// Combinado con el prefijo /api de app.js, queda /api/usuarios/...
router.use('/usuarios', usuarioRoutes);

module.exports = router;