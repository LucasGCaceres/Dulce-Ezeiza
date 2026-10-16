const consultaService = require('../services/Consulta.service');

// Limites: los mismos largos que las columnas de la tabla Consultas.
const LARGO_MAXIMO = {
    nombre: 100,
    email: 150,
    telefono: 50,
    asunto: 200,
    mensaje: 2000
};

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el texto sin espacios en los extremos, o null si no vino
// un string (un numero, un objeto, nada). Nunca confiamos en el tipo
// de lo que llega en el body de un endpoint publico.
function limpiarTexto(valor) {
    if (typeof valor !== 'string') {
        return null;
    }
    const limpio = valor.trim();
    return limpio === '' ? null : limpio;
}

// ------------------------------------------------------------
//  CREAR: POST /api/consultas  (requiere estar logueado)
// ------------------------------------------------------------
exports.crear = async function (req, res) {
    const body = req.body || {};

    const datos = {
        nombre: limpiarTexto(body.nombre),
        email: limpiarTexto(body.email),
        telefono: limpiarTexto(body.telefono),
        asunto: limpiarTexto(body.asunto),
        mensaje: limpiarTexto(body.mensaje),
        productoId: body.productoId ?? null
    };

    const errores = [];

    // 1. Obligatorios (despues del trim: "   " cuenta como vacio).
    if (!datos.nombre) errores.push('El nombre es obligatorio');
    if (!datos.email) errores.push('El email es obligatorio');
    if (!datos.asunto) errores.push('El asunto es obligatorio');
    if (!datos.mensaje) errores.push('El mensaje es obligatorio');

    // 2. Formato de email (solo si vino, para no repetir el error de arriba).
    if (datos.email && !FORMATO_EMAIL.test(datos.email)) {
        errores.push('El email no tiene un formato valido');
    }

    // 3. Largos maximos, campo por campo.
    for (const campo in LARGO_MAXIMO) {
        if (datos[campo] && datos[campo].length > LARGO_MAXIMO[campo]) {
            errores.push(`El campo ${campo} no puede superar los ${LARGO_MAXIMO[campo]} caracteres`);
        }
    }

    // 4. productoId es opcional, pero si viene tiene que ser un entero positivo.
    if (datos.productoId !== null && !(Number.isInteger(datos.productoId) && datos.productoId > 0)) {
        errores.push('El productoId debe ser un numero entero');
    }

    // Devolvemos todos los errores juntos, asi el frontend puede
    // marcar todos los campos con problemas de una sola vez.
    if (errores.length > 0) {
        return res.status(400).json({
            mensaje: 'Hay datos invalidos en la consulta',
            errores: errores
        });
    }

    try {
        const nuevaConsulta = await consultaService.crear(datos);
        return res.status(201).json({
            consulta: nuevaConsulta,
            mensaje: 'Consulta enviada correctamente'
        });
    } catch (e) {
        console.log(e);
        return res.status(400).json({ mensaje: 'No se pudo enviar la consulta' });
    }
};

// ------------------------------------------------------------
//  LISTAR: GET /api/consultas?estado=pendiente  (admin)
// ------------------------------------------------------------
exports.obtenerTodas = async function (req, res) {
    const filtros = {
        estado: req.query.estado
    };

    try {
        const consultas = await consultaService.obtenerTodas(filtros);
        return res.status(200).json(consultas);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  BUSCAR POR ID: GET /api/consultas/:id  (admin)
// ------------------------------------------------------------
exports.obtenerPorId = async function (req, res) {
    const id = req.params.id;

    try {
        const consulta = await consultaService.obtenerPorId(id);
        if (!consulta) {
            return res.status(404).json({ mensaje: 'Consulta no encontrada' });
        }
        return res.status(200).json(consulta);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  CAMBIAR ESTADO: PATCH /api/consultas/:id/estado  (admin)
// ------------------------------------------------------------
exports.cambiarEstado = async function (req, res) {
    const id = req.params.id;
    const nuevoEstado = req.body.estado;

    if (!nuevoEstado) {
        return res.status(400).json({ mensaje: 'Falta el nuevo estado' });
    }

    try {
        const consulta = await consultaService.cambiarEstado(id, nuevoEstado);
        return res.status(200).json({
            consulta: consulta,
            mensaje: 'Estado actualizado correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  ELIMINAR: DELETE /api/consultas/:id  (admin)
// ------------------------------------------------------------
exports.eliminar = async function (req, res) {
    const id = req.params.id;

    try {
        await consultaService.eliminar(id);
        return res.status(200).json({ mensaje: 'Consulta eliminada correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};