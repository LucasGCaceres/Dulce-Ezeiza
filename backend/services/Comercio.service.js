const Comercio = require('../models/Comercio.model');

// ------------------------------------------------------------
//  OBTENER: siempre devuelve la unica fila que existe
// ------------------------------------------------------------
exports.obtener = async function () {
    try {
        return await Comercio.findOne();
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener la informacion del comercio');
    }
};

// ------------------------------------------------------------
//  EDITAR: actualiza esa misma fila (nunca crea una nueva)
// ------------------------------------------------------------
exports.editar = async function (datos) {
    let comercio;

    try {
        comercio = await Comercio.findOne();
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la informacion del comercio');
    }

    if (!comercio) {
        throw new Error('No existe la informacion del comercio');
    }

    comercio.nombre = datos.nombre ?? comercio.nombre;
    comercio.descripcion = datos.descripcion ?? comercio.descripcion;
    comercio.direccion = datos.direccion ?? comercio.direccion;
    comercio.telefono = datos.telefono ?? comercio.telefono;
    comercio.instagram = datos.instagram ?? comercio.instagram;
    comercio.facebook = datos.facebook ?? comercio.facebook;
    comercio.whatsapp = datos.whatsapp ?? comercio.whatsapp;
    comercio.tiktok = datos.tiktok ?? comercio.tiktok;
    comercio.horarios = datos.horarios ?? comercio.horarios;

    try {
        await comercio.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar la informacion del comercio');
    }

    return comercio;
};