// Middleware de autorizacion: valida el JWT antes de dejar pasar la
// request a una ruta privada. Si no hay token o es invalido, corta
// la cadena aca mismo con 401 (nunca llega al controller).

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
        req.rol = decoded.rol;
        next();
    });
};

// Se usa DESPUES de verificarToken. No es que no sepamos quien es
// (eso ya lo resolvio verificarToken) -- es que su rol no le alcanza
// para esta accion puntual. Por eso 403, no 401.
const verificarAdmin = function (req, res, next) {
    if (req.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Se requiere rol de administrador.' });
    }
    next();
};

// Para rutas PUBLICAS que responden distinto segun quien pregunta (ej.: el
// catalogo, donde el admin ve tambien los productos dados de baja).
// Si viene un token valido, deja req.usuarioId y req.rol cargados igual que
// verificarToken. Si no viene, o es invalido, NO corta: sigue como visitante
// anonimo (req.rol queda undefined). Nunca responde 401.
const identificarUsuario = function (req, res, next) {
    const token = req.headers['x-access-token'];

    if (!token) {
        return next();
    }

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (!err) {
            req.usuarioId = decoded.id;
            req.rol = decoded.rol;
        }
        next();
    });
};

module.exports = {
    verificarToken: verificarToken,
    verificarAdmin: verificarAdmin,
    identificarUsuario: identificarUsuario
};