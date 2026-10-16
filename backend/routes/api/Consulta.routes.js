const express = require('express');
const router = express.Router();

const consultaController = require('../../controllers/Consulta.controller');
const { verificarToken, verificarAdmin } = require('../../middlewares/Autorizacion.middlewares');
const { limiteConsultas } = require('../../middlewares/RateLimit.middlewares');

// POST /api/consultas -> crear consulta (publico, con limite anti-spam)
router.post('/', limiteConsultas, consultaController.crear);

// GET  /api/consultas?estado=...  -> listar todas (admin)
router.get('/', verificarToken, verificarAdmin, consultaController.obtenerTodas);

// GET  /api/consultas/:id         -> una consulta por id (admin)
router.get('/:id', verificarToken, verificarAdmin, consultaController.obtenerPorId);

// PATCH /api/consultas/:id/estado -> cambiar el estado (admin)
router.patch('/:id/estado', verificarToken, verificarAdmin, consultaController.cambiarEstado);

// DELETE /api/consultas/:id       -> borrar consulta (admin)
router.delete('/:id', verificarToken, verificarAdmin, consultaController.eliminar);

module.exports = router;