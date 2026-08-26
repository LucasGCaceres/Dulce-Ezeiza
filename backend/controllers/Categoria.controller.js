// El controller traduce HTTP: lee req, llama al service, responde con res.
const categoriaService = require('../services/Categoria.service');

// ------------------------------------------------------------
//  CREAR: POST /api/categorias
// ------------------------------------------------------------
exports.crear = async function (req, res) {
    const datos = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        activa: req.body.activa
    };

    // Validacion: el nombre es obligatorio.
    if (!datos.nombre) {
        return res.status(400).json({ mensaje: 'El nombre de la categoria es obligatorio' });
    }

    try {
        const nuevaCategoria = await categoriaService.crear(datos);
        return res.status(201).json({
            categoria: nuevaCategoria,
            mensaje: 'Categoria creada correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  LISTAR TODAS: GET /api/categorias
// ------------------------------------------------------------
exports.obtenerTodas = async function (req, res) {
    try {
        const categorias = await categoriaService.obtenerTodas();
        return res.status(200).json(categorias);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  BUSCAR POR ID: GET /api/categorias/:id
// ------------------------------------------------------------
exports.obtenerPorId = async function (req, res) {
    // El id viene en la URL (/api/categorias/3), se lee de req.params.
    const id = req.params.id;

    try {
        const categoria = await categoriaService.obtenerPorId(id);

        // Si el service devolvio null, no existe: 404 Not Found.
        if (!categoria) {
            return res.status(404).json({ mensaje: 'Categoria no encontrada' });
        }

        return res.status(200).json(categoria);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  EDITAR: PUT /api/categorias/:id
// ------------------------------------------------------------
exports.editar = async function (req, res) {
    const id = req.params.id;
    const datos = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        activa: req.body.activa
    };

    try {
        const categoriaEditada = await categoriaService.editar(id, datos);
        return res.status(200).json({
            categoria: categoriaEditada,
            mensaje: 'Categoria actualizada correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  ELIMINAR: DELETE /api/categorias/:id
// ------------------------------------------------------------
exports.eliminar = async function (req, res) {
    const id = req.params.id;

    try {
        await categoriaService.eliminar(id);
        return res.status(200).json({ mensaje: 'Categoria eliminada correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};