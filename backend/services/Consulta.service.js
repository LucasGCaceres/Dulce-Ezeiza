const Consulta = require('../models/Consulta.model');
const Producto = require('../models/Producto.model');

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
            productoId: datos.productoId   // puede venir o no (opcional)
            // estado no se manda: la base lo pone en 'pendiente' por default
        });
        return nuevaConsulta;
    } catch (e) {
        console.log(e);
        throw new Error('Error al crear la consulta');
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
            // Incluye el producto relacionado (si la consulta tiene uno).
            include: [{ model: Producto }],
            order: [['fecha', 'DESC']]   // las mas nuevas primero
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
            include: [{ model: Producto }]
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
    try {
        // Validamos que el estado sea uno de los permitidos.
        const estadosValidos = ['pendiente', 'leida', 'respondida'];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error('Estado invalido. Debe ser: pendiente, leida o respondida');
        }

        const consulta = await Consulta.findByPk(id);
        if (!consulta) {
            throw new Error('La consulta no existe');
        }

        consulta.estado = nuevoEstado;
        await consulta.save();
        return consulta;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};

// ------------------------------------------------------------
//  ELIMINAR una consulta
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    try {
        const consulta = await Consulta.findByPk(id);
        if (!consulta) {
            throw new Error('La consulta no existe');
        }
        await consulta.destroy();
        return true;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};