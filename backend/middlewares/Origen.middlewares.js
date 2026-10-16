// Middleware de origen: la API solo acepta llamados que vengan del frontend.
//
// El navegador agrega solo el header "Origin" (ej: http://localhost:5173)
// en cada pedido que hace el front a la API. Si ese origen no esta en la
// lista de FRONTEND_URL del .env, se corta con 403 ANTES de llegar al
// controller -- asi la request ni siquiera se ejecuta.
//
// Ojo: esto frena a otras paginas web, no a alguien que arme el pedido a
// mano (curl, Postman) falsificando el header. Es una capa mas, no reemplaza
// a verificarToken/verificarAdmin en las rutas que modifican datos.

// FRONTEND_URL puede tener uno o varios origenes separados por coma.
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(function (origen) { return origen.trim(); })
    .filter(function (origen) { return origen !== ''; });

const verificarOrigen = function (req, res, next) {
    const origen = req.headers.origin;

    if (origen && origenesPermitidos.includes(origen)) {
        return next();
    }

    // Sin header Origin = no viene de un navegador (Postman, curl).
    // En development se deja pasar para poder probar la API con la
    // coleccion de Postman; en production se rechaza.
    if (!origen && process.env.NODE_ENV !== 'production') {
        return next();
    }

    return res.status(403).json({ mensaje: 'Origen no permitido.' });
};

module.exports = {
    origenesPermitidos: origenesPermitidos,
    verificarOrigen: verificarOrigen
};