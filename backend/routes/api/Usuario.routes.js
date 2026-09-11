const express = require('express');
const router = express.Router();

// Traemos el controller: cada ruta va a apuntar a una de sus funciones.
const usuarioController = require('../../controllers/usuario.controller');
const verificarToken = require('../../middlewares/Autorizacion.middlewares');

// POST /api/usuarios/registro  -> crea un usuario nuevo
router.post('/registro', usuarioController.registrar);

// POST /api/usuarios/login     -> valida credenciales y devuelve token
router.post('/login', usuarioController.login);

// GET  /api/usuarios/perfil   -> el usuario logueado ve sus propios datos
router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);

// PUT  /api/usuarios/perfil    -> el usuario logueado edita su propio perfil
router.put('/perfil', verificarToken, usuarioController.editarPerfil);

// Exportamos el router para que api.js lo pueda montar.
module.exports = router;