const consultaService = require('../services/Consulta.service');

// ------------------------------------------------------------
//  CREAR: POST /api/consultas  (publico, lo usa el visitante)
// ------------------------------------------------------------
// ------------------------------------------------------------
//  CREAR: POST /api/consultas  (requiere estar logueado, Escenario B)
// ------------------------------------------------------------
exports.crear = async function (req, res) {
    const datos = {
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        asunto: req.body.asunto,
        mensaje: req.body.mensaje,
        productoId: req.body.productoId,
        usuarioId: req.usuarioId   // viene del token verificado, NUNCA del body
    };

    // Validacion: nombre, email, asunto y mensaje son obligatorios.
    if (!datos.nombre || !datos.email || !datos.asunto || !datos.mensaje) {
        return res.status(400).json({
            mensaje: 'Faltan datos obligatorios: nombre, email, asunto y mensaje'
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
//  MIS CONSULTAS: GET /api/consultas/mis-consultas  (cliente logueado)
// ------------------------------------------------------------
exports.obtenerMisConsultas = async function (req, res) {
    try {
        const consultas = await consultaService.obtenerPorUsuario(req.usuarioId);
        return res.status(200).json(consultas);
    } catch (e) {
        console.log(e);
        return res.status(400).json({ mensaje: 'No se pudieron obtener tus consultas' });
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