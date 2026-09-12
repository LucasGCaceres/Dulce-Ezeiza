const express = require('express');
const router = express.Router();

const consultaController = require('../../controllers/Consulta.controller');
const { verificarToken, verificarAdmin } = require('../../middlewares/Autorizacion.middlewares');

// POST /api/consultas -> crear consulta (requiere estar logueado)
router.post('/', verificarToken, consultaController.crear);

// GET  /api/consultas/mis-consultas -> historial del usuario logueado
router.get('/mis-consultas', verificarToken, consultaController.obtenerMisConsultas);

// GET  /api/consultas?estado=...  -> listar todas (admin)
router.get('/', verificarToken, verificarAdmin, consultaController.obtenerTodas);

// GET  /api/consultas/:id         -> una consulta por id (admin)
router.get('/:id', verificarToken, verificarAdmin, consultaController.obtenerPorId);

// PATCH /api/consultas/:id/estado -> cambiar el estado (admin)
router.patch('/:id/estado', verificarToken, verificarAdmin, consultaController.cambiarEstado);

// DELETE /api/consultas/:id       -> borrar consulta (admin)
router.delete('/:id', verificarToken, verificarAdmin, consultaController.eliminar);

module.exports = router;