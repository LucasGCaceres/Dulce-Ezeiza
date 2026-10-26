const { Op } = require('sequelize');
const Novedad = require('../models/Novedad.model');
const Producto = require('../models/Producto.model');
const ImagenProducto = require('../models/ImagenProducto.model');

// Producto relacionado, para el sitio publico: nombre, precio y sus fotos
// (la de orden 0 es la portada). Con where + required: false, si el
// producto esta dado de baja la novedad se muestra igual, pero SIN el
// producto (Producto queda null): asi el front no linkea a un detalle que
// daria 404.
const INCLUIR_PRODUCTO_PUBLICO = {
    model: Producto,
    attributes: ['id', 'nombre'],
    where: { activo: true },
    required: false,
    include: [
        { model: ImagenProducto, as: 'imagenes', attributes: ['id', 'url', 'orden'], separate: true, order: [['orden', 'ASC']] }
    ]
};

// Para el panel: el admin ve el producto aunque este dado de baja.
const INCLUIR_PRODUCTO_ADMIN = {
    model: Producto,
    attributes: ['id', 'nombre', 'activo']
};

// Condicion "visible para el publico": publicada y con fecha ya cumplida.
// Se arma en una funcion (y no en una constante) para que new Date() sea
// el momento de cada request, no el momento en que arranco el servidor.
function condicionVisible() {
    return {
        publicada: true,
        fechaPublicacion: { [Op.lte]: new Date() }
    };
}

// Si viene un productoId, el producto tiene que existir. Se valida aca y
// no en el controller porque necesita consultar la base.
async function verificarProducto(productoId) {
    if (productoId == null) {
        return;
    }

    let producto;
    try {
        producto = await Producto.findByPk(productoId);
    } catch (e) {
        console.log(e);
        throw new Error('Error al verificar el producto relacionado');
    }

    if (!producto) {
        throw new Error('El producto relacionado no existe');
    }
}

// ------------------------------------------------------------
//  LISTAR las visibles (sitio publico)
// ------------------------------------------------------------
// limite (opcional): cuantas traer. Inicio pide las 3 mas nuevas.
exports.obtenerPublicadas = async function (limite) {
    try {
        const opciones = {
            where: condicionVisible(),
            include: [INCLUIR_PRODUCTO_PUBLICO],
            order: [['fechaPublicacion', 'DESC']]
        };

        if (limite) {
            opciones.limit = limite;
        }

        return await Novedad.findAll(opciones);
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener las novedades');
    }
};

// ------------------------------------------------------------
//  BUSCAR una visible por id (sitio publico)
// ------------------------------------------------------------
// Devuelve null si no existe O si todavia no es visible: para el publico
// un borrador "no existe", asi no se filtra que hay algo por salir.
exports.obtenerPublicadaPorId = async function (id) {
    try {
        return await Novedad.findOne({
            where: { id: id, ...condicionVisible() },
            include: [INCLUIR_PRODUCTO_PUBLICO]
        });
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener la novedad');
    }
};

// ------------------------------------------------------------
//  LISTAR todas, incluidos borradores (panel de admin)
// ------------------------------------------------------------
exports.obtenerTodas = async function () {
    try {
        return await Novedad.findAll({
            include: [INCLUIR_PRODUCTO_ADMIN],
            order: [['fechaPublicacion', 'DESC']]
        });
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener las novedades');
    }
};

// ------------------------------------------------------------
//  CREAR una novedad
// ------------------------------------------------------------
exports.crear = async function (datos) {
    await verificarProducto(datos.productoId);

    let nuevaNovedad;
    try {
        nuevaNovedad = await Novedad.create({
            titulo: datos.titulo,
            resumen: datos.resumen,
            contenido: datos.contenido,
            imagenUrl: datos.imagenUrl ?? null,
            fechaPublicacion: datos.fechaPublicacion ?? new Date(),
            publicada: datos.publicada ?? false,
            productoId: datos.productoId ?? null
        });
    } catch (e) {
        console.log(e);
        throw new Error('Error al crear la novedad');
    }

    return await Novedad.findByPk(nuevaNovedad.id, { include: [INCLUIR_PRODUCTO_ADMIN] });
};

// ------------------------------------------------------------
//  EDITAR una novedad (incluido publicar / despublicar)
// ------------------------------------------------------------
exports.editar = async function (id, datos) {
    let novedad;
    try {
        novedad = await Novedad.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la novedad');
    }

    if (!novedad) {
        throw new Error('La novedad no existe');
    }

    await verificarProducto(datos.productoId);

    novedad.titulo = datos.titulo ?? novedad.titulo;
    novedad.resumen = datos.resumen ?? novedad.resumen;
    novedad.contenido = datos.contenido ?? novedad.contenido;
    novedad.fechaPublicacion = datos.fechaPublicacion ?? novedad.fechaPublicacion;
    novedad.publicada = datos.publicada ?? novedad.publicada;

    // imagenUrl y productoId se pueden QUITAR mandando null. Con ?? no se
    // podria (null ?? valorViejo da valorViejo), asi que aca se distingue
    // "no vino el campo" (undefined: no se toca) de "vino en null" (se borra).
    if (datos.imagenUrl !== undefined) {
        novedad.imagenUrl = datos.imagenUrl;
    }
    if (datos.productoId !== undefined) {
        novedad.productoId = datos.productoId;
    }

    try {
        await novedad.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar la novedad');
    }

    return await Novedad.findByPk(id, { include: [INCLUIR_PRODUCTO_ADMIN] });
};

// ------------------------------------------------------------
//  ELIMINAR una novedad
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    let novedad;
    try {
        novedad = await Novedad.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la novedad');
    }

    if (!novedad) {
        throw new Error('La novedad no existe');
    }

    try {
        await novedad.destroy();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo eliminar la novedad');
    }

    return true;
};