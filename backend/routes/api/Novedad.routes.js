const express = require('express');
const router = express.Router();

const novedadController = require('../../controllers/Novedad.controller');
const { verificarToken, verificarAdmin } = require('../../middlewares/Autorizacion.middlewares');

// GET    /api/novedades              -> publicadas y con fecha cumplida, de la mas nueva a la mas vieja (?limite=3)
router.get('/', novedadController.obtenerPublicadas);

// GET    /api/novedades/admin/todas  -> todas, incluidos borradores (panel)
// Se declara antes que '/:id' por costumbre: Express prueba las rutas en
// orden y '/:id' agarra cualquier segmento suelto (un '/admin' a secas
// llegaria como id = "admin"). Las rutas fijas, siempre arriba.
router.get('/admin/todas', verificarToken, verificarAdmin, novedadController.obtenerTodas);

// GET    /api/novedades/:id          -> detalle publico (404 si es borrador)
router.get('/:id', novedadController.obtenerPublicadaPorId);

// POST   /api/novedades              -> crea una novedad (por defecto, borrador)
router.post('/', verificarToken, verificarAdmin, novedadController.crear);

// PUT    /api/novedades/:id          -> edita, incluido publicar/despublicar
router.put('/:id', verificarToken, verificarAdmin, novedadController.editar);

// DELETE /api/novedades/:id          -> borra
router.delete('/:id', verificarToken, verificarAdmin, novedadController.eliminar);

module.exports = router;