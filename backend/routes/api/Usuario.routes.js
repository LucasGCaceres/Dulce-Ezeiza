const express = require('express');
const router = express.Router();

// Traemos el controller: cada ruta va a apuntar a una de sus funciones.
const usuarioController = require('../../controllers/usuario.controller');
const  { verificarToken } = require('../../middlewares/Autorizacion.middlewares');

// POST /api/usuarios/registro  -> crea un usuario nuevo
router.post('/registro', usuarioController.registrar);

// POST /api/usuarios/login     -> valida credenciales y devuelve token
router.post('/login', usuarioController.login);

// GET  /api/usuarios/perfil   -> el usuario logueado ve sus propios datos
router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);

// PUT  /api/usuarios/perfil    -> el usuario logueado edita su propio perfil
router.put('/perfil', verificarToken, usuarioController.editarPerfil);

// POST /api/usuarios/cambiar-password -> el usuario logueado cambia su propia contraseña
router.put('/cambiar-password', verificarToken, usuarioController.cambiarPassword);

// POST /api/usuarios/recuperar-password -> pide el codigo de recuperacion por mail (sin login)
router.post('/recuperar-password', usuarioController.solicitarRecuperacion);

// PUT  /api/usuarios/resetear-password  -> cambia la contraseña usando el codigo (sin login)
router.put('/resetear-password', usuarioController.resetearPassword);

// Exportamos el router para que api.js lo pueda montar.
module.exports = router;