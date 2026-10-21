const sequelize = require('../databases/database');
const Consulta = require('../models/Consulta.model');
const Producto = require('../models/Producto.model');
const ConsultaProducto = require('../models/ConsultaProducto.model');

// Como se incluyen los productos al leer una consulta:
// - as: 'productos' tiene que coincidir con el alias de Associations.js.
// - through: { attributes: [] } evita que cada producto venga con la fila
//   de la tabla intermedia pegada (no aporta nada al frontend).
const INCLUIR_PRODUCTOS = {
    model: Producto,
    as: 'productos',
    attributes: ['id', 'nombre'],
    through: { attributes: [] }
};

// ------------------------------------------------------------
//  CREAR una consulta (la manda un visitante desde el formulario)
// ------------------------------------------------------------
exports.crear = async function (datos) {
    const ids = datos.productoIds;

    // 1. Si eligio productos, tienen que existir y estar activos.
    //    Contamos cuantos de esos ids cumplen: si falta alguno, no seguimos.
    if (ids.length > 0) {
        let encontrados;
        try {
            encontrados = await Producto.count({ where: { id: ids, activo: true } });
        } catch (e) {
            console.log(e);
            throw new Error('Error al verificar los productos de la consulta');
        }
        if (encontrados !== ids.length) {
            throw new Error('Alguno de los productos elegidos no existe o no esta disponible');
        }
    }

    // 2. Guardamos la consulta y sus productos en una TRANSACCION:
    //    o se guarda todo, o no se guarda nada. Sin esto, si fallara el
    //    segundo paso quedaria una consulta guardada sin sus productos.
    try {
        const nuevaConsulta = await sequelize.transaction(async (t) => {
            const consulta = await Consulta.create({
                nombre: datos.nombre,
                email: datos.email,
                telefono: datos.telefono,
                asunto: datos.asunto,
                mensaje: datos.mensaje
                // estado no se manda: la base lo pone en 'pendiente' por default
            }, { transaction: t });

            if (ids.length > 0) {
                // Inserta una fila en ConsultaProductos por cada id.
                await consulta.setProductos(ids, { transaction: t });
            }

            return consulta;
        });

        // Devolvemos la consulta ya con sus productos incluidos.
        return await Consulta.findByPk(nuevaConsulta.id, { include: [INCLUIR_PRODUCTOS] });
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
            include: [INCLUIR_PRODUCTOS],
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
            include: [INCLUIR_PRODUCTOS],
        });
        return consulta;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener la consulta');
    }
};

// ------------------------------------------------------------
//  CAMBIAR EL ESTADO de una consulta (pendiente/respondida/cerrada)
// ------------------------------------------------------------
exports.cambiarEstado = async function (id, nuevoEstado) {
    // Validacion pura, sin tocar la base: no necesita try/catch.
    const estadosValidos = ['pendiente', 'respondida', 'cerrada'];
    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado invalido. Debe ser: pendiente, respondida o cerrada');
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

    // Primero se borran sus filas en ConsultaProductos (la FK no tiene
    // ON DELETE CASCADE, igual que ImagenesProducto) y despues la consulta.
    // En una transaccion, para no dejar la consulta a medio borrar.
    try {
        await sequelize.transaction(async (t) => {
            await ConsultaProducto.destroy({ where: { consultaId: id }, transaction: t });
            await consulta.destroy({ transaction: t });
        });
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo eliminar la consulta');
    }

    return true;
};