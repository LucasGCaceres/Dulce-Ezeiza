// Limitadores de pedidos (rate limiting). Cada uno cuenta pedidos por IP
// dentro de una ventana de tiempo; si se pasa del limite, corta con 429
// ("Too Many Requests") y la request nunca llega al controller.
const { rateLimit } = require('express-rate-limit');

// LOGIN: es la unica puerta al panel, asi que es el blanco de quien
// quiera adivinar la contraseña probando muchas.
// skipSuccessfulRequests: solo cuentan los intentos FALLIDOS (status >= 400),
// asi el admin que entra bien no gasta intentos.
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,   // ventana de 15 minutos
    limit: 5,                   // 5 intentos fallidos por IP en esa ventana
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8', // informa el limite en headers estandar
    legacyHeaders: false,       // no manda los headers viejos X-RateLimit-*
    message: { mensaje: 'Demasiados intentos fallidos. Probá de nuevo en 15 minutos.' }
});

// RECUPERAR PASSWORD: cada pedido manda un mail, asi que sin limite
// alguien podria usarlo para inundar la casilla del admin.
const limiteRecuperacion = rateLimit({
    windowMs: 60 * 60 * 1000,   // ventana de 1 hora
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { mensaje: 'Demasiados pedidos de recuperación. Probá de nuevo más tarde.' }
});

// CONSULTAS: el formulario es publico, esto frena el spam.
const limiteConsultas = rateLimit({
    windowMs: 60 * 60 * 1000,   // ventana de 1 hora
    limit: 5,                   // 5 consultas por IP por hora
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { mensaje: 'Enviaste demasiadas consultas. Probá de nuevo más tarde.' }
});

module.exports = {
    limiteLogin: limiteLogin,
    limiteRecuperacion: limiteRecuperacion,
    limiteConsultas: limiteConsultas
};