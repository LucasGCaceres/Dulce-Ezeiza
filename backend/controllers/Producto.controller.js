const productoService = require('../services/Producto.service');

// ------------------------------------------------------------
//  CREAR: POST /api/productos
// ------------------------------------------------------------
exports.crear = async function (req, res) {
    const datos = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        categoriaId: req.body.categoriaId,
        disponible: req.body.disponible,
        activo: req.body.activo,
        destacado: req.body.destacado,
        sinGluten: req.body.sinGluten
    };

    // Validaciones: nombre, precio y categoria son obligatorios.
    if (!datos.nombre || datos.precio == null || !datos.categoriaId) {
        return res.status(400).json({
            mensaje: 'Faltan datos obligatorios: nombre, precio y categoriaId'
        });
    }

    try {
        const nuevoProducto = await productoService.crear(datos);
        return res.status(201).json({
            producto: nuevoProducto,
            mensaje: 'Producto creado correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  LISTAR con filtros: GET /api/productos?busqueda=...&categoriaId=...&sinGluten=true
// ------------------------------------------------------------
exports.obtenerTodos = async function (req, res) {
    // Los filtros vienen en la URL, se leen de req.query.
    const filtros = {
        busqueda: req.query.busqueda,
        categoriaId: req.query.categoriaId,
        soloActivos: req.query.soloActivos === 'true',
        sinGluten: req.query.sinGluten === 'true'
    };

    try {
        const productos = await productoService.obtenerTodos(filtros);
        return res.status(200).json(productos);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  BUSCAR POR ID: GET /api/productos/:id
// ------------------------------------------------------------
exports.obtenerPorId = async function (req, res) {
    const id = req.params.id;

    try {
        const producto = await productoService.obtenerPorId(id);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        return res.status(200).json(producto);
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  EDITAR: PUT /api/productos/:id
// ------------------------------------------------------------
exports.editar = async function (req, res) {
    const id = req.params.id;
    const datos = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        categoriaId: req.body.categoriaId,
        disponible: req.body.disponible,
        activo: req.body.activo,
        destacado: req.body.destacado,
        sinGluten: req.body.sinGluten
    };

    try {
        const productoEditado = await productoService.editar(id, datos);
        return res.status(200).json({
            producto: productoEditado,
            mensaje: 'Producto actualizado correctamente'
        });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  ELIMINAR: DELETE /api/productos/:id
// ------------------------------------------------------------
exports.eliminar = async function (req, res) {
    const id = req.params.id;

    try {
        await productoService.eliminar(id);
        return res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};