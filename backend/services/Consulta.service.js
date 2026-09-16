const Consulta = require('../models/Consulta.model');
const Producto = require('../models/Producto.model');
const Usuario = require('../models/Usuario.model');

// ------------------------------------------------------------
//  CREAR una consulta (la manda un visitante desde el formulario)
// ------------------------------------------------------------
exports.crear = async function (datos) {
    try {
        const nuevaConsulta = await Consulta.create({
            nombre: datos.nombre,
            email: datos.email,
            telefono: datos.telefono,
            asunto: datos.asunto,
            mensaje: datos.mensaje,
            productoId: datos.productoId,
            usuarioId: datos.usuarioId
            // estado no se manda: la base lo pone en 'pendiente' por default
        });
        return nuevaConsulta;
    } catch (e) {
        console.log(e);
        throw new Error('Error al crear la consulta');
    }
};

// ------------------------------------------------------------
//  LISTAR las consultas de UN usuario (para su propio historial)
// ------------------------------------------------------------
exports.obtenerPorUsuario = async function (usuarioId) {
    try {
        const consultas = await Consulta.findAll({
            where: { usuarioId: usuarioId },
            include: [{ model: Producto }],
            order: [['fecha', 'DESC']]
        });
        return consultas;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener tus consultas');
    }
};

// ------------------------------------------------------------
//  LISTAR todas las consultas (para el admin)
// ------------------------------------------------------------
// Opcionalmente filtra por estado: { estado: 'pendiente' }
exports.obtenerTodas = async function (filtros = {}) {
    try {
        const where = {};

        if (filtros.estado) {
            where.estado = filtros.estado;
        }

        const consultas = await Consulta.findAll({
            where: where,
            include: [
                { model: Producto },
                { model: Usuario, attributes: { exclude: ['password'] } }
            ],
            order: [['fecha', 'DESC']]
        });
        return consultas;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener las consultas');
    }
};

// ------------------------------------------------------------
//  BUSCAR una consulta por id
// ------------------------------------------------------------
exports.obtenerPorId = async function (id) {
    try {
        const consulta = await Consulta.findByPk(id, {
            include: [
                { model: Producto },
                { model: Usuario, attributes: { exclude: ['password'] } }
            ]
        });
        return consulta;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener la consulta');
    }
};

// ------------------------------------------------------------
//  CAMBIAR EL ESTADO de una consulta (pendiente/leida/respondida)
// ------------------------------------------------------------
exports.cambiarEstado = async function (id, nuevoEstado) {
    // Validacion pura, sin tocar la base: no necesita try/catch.
    const estadosValidos = ['pendiente', 'leida', 'respondida'];
    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado invalido. Debe ser: pendiente, leida o respondida');
    }

    let consulta;

    try {
        consulta = await Consulta.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la consulta');
    }

    if (!consulta) {
        throw new Error('La consulta no existe');
    }

    consulta.estado = nuevoEstado;

    try {
        await consulta.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar el estado de la consulta');
    }

    return consulta;
};

// ------------------------------------------------------------
//  ELIMINAR una consulta
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    let consulta;

    try {
        consulta = await Consulta.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la consulta');
    }

    if (!consulta) {
        throw new Error('La consulta no existe');
    }

    try {
        await consulta.destroy();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo eliminar la consulta');
    }

    return true;
};