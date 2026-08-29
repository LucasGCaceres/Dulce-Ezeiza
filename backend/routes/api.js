const express = require('express');
const router = express.Router();

// Router principal de la API. Junta las rutas de cada entidad.

const usuarioRoutes = require('./api/Usuario.routes');
const categoriaRoutes = require('./api/Categoria.routes');
const productoRoutes = require('./api/Producto.routes');
const consultaRoutes = require('./api/Consulta.routes');

router.use('/usuarios', usuarioRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/consultas', consultaRoutes);

module.exports = router;