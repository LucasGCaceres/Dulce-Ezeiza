// Middleware de autorizacion: valida el JWT antes de dejar pasar la
// request a una ruta privada. Si no hay token o es invalido, corta
// la cadena aca mismo con 401 (nunca llega al controller).
//
// Version corregida segun el apunte: cada respuesta de error lleva
// un "return" antes, y el status es 401 (no 500) porque el problema
// es que el CLIENTE no se identifico bien, no que el servidor fallo.
const jwt = require('jsonwebtoken');

const verificarToken = function (req, res, next) {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ autenticado: false, mensaje: 'No se proporciono un token.' });
    }

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).json({ autenticado: false, mensaje: 'Token invalido.' });
        }

        req.usuarioId = decoded.id;
        next();
    });
};

module.exports = verificarToken;