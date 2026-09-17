const express = require('express');
const router = express.Router();

const comercioController = require('../../controllers/Comercio.controller');
const { verificarToken, verificarAdmin } = require('../../middlewares/Autorizacion.middlewares');

// GET  /api/comercio -> info institucional (publico, la ve cualquier visitante)
router.get('/', comercioController.obtener);

// PUT  /api/comercio -> edita esa info (admin)
router.put('/', verificarToken, verificarAdmin, comercioController.editar);

module.exports = router;