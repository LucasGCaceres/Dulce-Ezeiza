const express = require('express');
const router = express.Router();

const consultaController = require('../../controllers/Consulta.controller');

// POST /api/consultas             -> crear consulta (publico, del visitante)
router.post('/', consultaController.crear);

// GET  /api/consultas?estado=...  -> listar todas (admin)
router.get('/', consultaController.obtenerTodas);

// GET  /api/consultas/:id         -> una consulta por id (admin)
router.get('/:id', consultaController.obtenerPorId);

// PATCH /api/consultas/:id/estado -> cambiar el estado (admin)
router.patch('/:id/estado', consultaController.cambiarEstado);

// DELETE /api/consultas/:id       -> borrar consulta (admin)
router.delete('/:id', consultaController.eliminar);

module.exports = router;