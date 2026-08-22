const express = require('express');
const router = express.Router();

// Traemos el controller: cada ruta va a apuntar a una de sus funciones.
const usuarioController = require('../../controllers/usuario.controller');

// Cada linea conecta un VERBO + RUTA con una funcion del controller.
// Cuando llega un pedido que coincide, Express llama a esa funcion
// pasandole (req, res) automaticamente.

// POST /api/usuarios/registro  -> crea un usuario nuevo
router.post('/registro', usuarioController.registrar);

// POST /api/usuarios/login     -> valida credenciales y devuelve token
router.post('/login', usuarioController.login);

// Exportamos el router para que api.js lo pueda montar.
module.exports = router;