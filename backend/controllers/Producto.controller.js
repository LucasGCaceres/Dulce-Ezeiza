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
        sinGluten: req.body.sinGluten,
        imagenes: req.body.imagenes // opcional: array de URLs para la carga inicial
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

// ------------------------------------------------------------
//  AGREGAR IMAGEN(ES): POST /api/productos/:productoId/imagenes
//  body: { "url": "https://..." }               -> una sola
//  body: { "urls": ["https://...", "https://..."] } -> varias de una,
// ------------------------------------------------------------
exports.agregarImagen = async function (req, res) {
    const productoId = req.params.productoId;

    let urls = req.body.urls;
    if (!Array.isArray(urls)) {
        urls = req.body.url ? [req.body.url] : [];
    }

    if (urls.length === 0) {
        return res.status(400).json({ mensaje: 'Falta la url (o urls) de la imagen' });
    }

    try {
        const imagenes = await productoService.agregarImagenes(productoId, urls);
        return res.status(201).json({ imagenes: imagenes, mensaje: 'Imagen(es) agregada(s) correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  ELIMINAR IMAGEN(ES): DELETE /api/productos/:productoId/imagenes
//  body: { "imagenId": 5 }                 -> una sola
//  body: { "imagenesIds": [5, 6, 7] }      -> varias de una
// ------------------------------------------------------------
exports.eliminarImagen = async function (req, res) {
    const productoId = req.params.productoId;
 
    let imagenesIds = req.body.imagenesIds;
    if (!Array.isArray(imagenesIds)) {
        imagenesIds = req.body.imagenId ? [req.body.imagenId] : [];
    }
 
    if (imagenesIds.length === 0) {
        return res.status(400).json({ mensaje: 'Falta el id (o ids) de la imagen a eliminar' });
    }
 
    try {
        await productoService.eliminarImagenes(productoId, imagenesIds);
        return res.status(200).json({ mensaje: 'Imagen(es) eliminada(s) correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  REORDENAR IMAGENES: PUT /api/productos/:productoId/imagenes/orden
//  body: { "orden": [7, 5, 6] }  -> ids de TODAS las imagenes, en el orden deseado
// ------------------------------------------------------------
exports.reordenarImagenes = async function (req, res) {
    const productoId = req.params.productoId;
    const orden = req.body.orden;

    if (!Array.isArray(orden)) {
        return res.status(400).json({ mensaje: 'Falta el array de orden (ids de las imagenes)' });
    }

    try {
        await productoService.reordenarImagenes(productoId, orden);
        return res.status(200).json({ mensaje: 'Orden actualizado correctamente' });
    } catch (e) {
        return res.status(400).json({ mensaje: e.message });
    }
};