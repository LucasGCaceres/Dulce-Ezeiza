const Producto = require('../models/Producto.model');
const Categoria = require('../models/Categoria.model');
const Consulta = require('../models/Consulta.model');
const ImagenProducto = require('../models/ImagenProducto.model');
const { Op } = require('sequelize');   // Op = operadores (LIKE, mayor que, etc.)

// Se reutiliza en obtenerTodos/obtenerPorId/crear/editar para siempre traer
// la categoria y las imagenes (ya ordenadas) junto con el producto.
const includeCompleto = [
    { model: Categoria },
    { model: ImagenProducto, as: 'imagenes', separate: true, order: [['orden', 'ASC']] }
];

// ------------------------------------------------------------
//  CREAR un producto
// ------------------------------------------------------------
// datos.imagenes (opcional): array de URLs para cargar de una al crear el
// producto. Para agregar/sacar/reordenar fotos DESPUES de creado, se usan
// los endpoints dedicados de mas abajo (agregarImagen, eliminarImagen,
// reordenarImagenes) en vez de volver a pasar por aca.
exports.crear = async function (datos) {
    let nuevoProducto;
    try {
        nuevoProducto = await Producto.create({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio: datos.precio,
            categoriaId: datos.categoriaId,
            disponible: datos.disponible ?? true,
            activo: datos.activo ?? true,
            destacado: datos.destacado ?? false,
            sinGluten: datos.sinGluten ?? false
        });
    } catch (e) {
        console.log(e);
        throw new Error('Error al crear el producto');
    }

    if (Array.isArray(datos.imagenes) && datos.imagenes.length > 0) {
        try {
            const filas = datos.imagenes.map(function (url, indice) {
                return { productoId: nuevoProducto.id, url: url, orden: indice };
            });
            await ImagenProducto.bulkCreate(filas);
        } catch (e) {
            console.log(e);
            throw new Error('El producto se creo pero no se pudieron guardar las imagenes');
        }
    }

    return await Producto.findByPk(nuevoProducto.id, { include: includeCompleto });
};

// ------------------------------------------------------------
//  LISTAR productos con busqueda y filtros (para el catalogo)
// ------------------------------------------------------------
// Recibe un objeto 'filtros' opcional: { busqueda, categoriaId, soloActivos, sinGluten }
exports.obtenerTodos = async function (filtros = {}) {
    try {
        // Vamos armando las condiciones del WHERE segun que filtros llegaron.
        const where = {};

        // Filtro por texto: busca en el nombre (LIKE '%texto%').
        if (filtros.busqueda) {
            where.nombre = { [Op.like]: '%' + filtros.busqueda + '%' };
        }

        // Filtro por categoria.
        if (filtros.categoriaId) {
            where.categoriaId = filtros.categoriaId;
        }

        // Para el sitio publico solo se muestran los activos.
        if (filtros.soloActivos) {
            where.activo = true;
        }

        if (filtros.sinGluten) {
            where.sinGluten = true;
        }

        const productos = await Producto.findAll({
            where: where,
            include: includeCompleto
        });

        return productos;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener los productos');
    }
};

// ------------------------------------------------------------
//  BUSCAR un producto por id (con su categoria y sus imagenes)
// ------------------------------------------------------------
exports.obtenerPorId = async function (id) {
    try {
        const producto = await Producto.findByPk(id, { include: includeCompleto });
        return producto;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener el producto');
    }
};

// ------------------------------------------------------------
//  EDITAR un producto (datos basicos; las imagenes NO se tocan desde aca)
// ------------------------------------------------------------
exports.editar = async function (id, datos) {
    let producto;
    try {
        producto = await Producto.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar el producto');
    }
    if (!producto) {
        throw new Error('El producto no existe');
    }

    producto.nombre = datos.nombre ?? producto.nombre;
    producto.descripcion = datos.descripcion ?? producto.descripcion;
    producto.precio = datos.precio ?? producto.precio;
    producto.categoriaId = datos.categoriaId ?? producto.categoriaId;
    producto.disponible = datos.disponible ?? producto.disponible;
    producto.activo = datos.activo ?? producto.activo;
    producto.destacado = datos.destacado ?? producto.destacado;
    producto.sinGluten = datos.sinGluten ?? producto.sinGluten;

    try {
        await producto.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar el producto');
    }

    return await Producto.findByPk(id, { include: includeCompleto });
};

// ------------------------------------------------------------
//  ELIMINAR un producto
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    let producto;
    try {
        producto = await Producto.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar el producto');
    }
    if (!producto) {
        throw new Error('El producto no existe');
    }
 
    let cantidadConsultas;
    try {
        cantidadConsultas = await Consulta.count({ where: { productoId: id } });
    } catch (e) {
        console.log(e);
        throw new Error('Error al verificar las consultas asociadas');
    }
    if (cantidadConsultas > 0) {
        throw new Error('No se puede eliminar el producto: tiene consultas asociadas');
    }
 
    try {
        await ImagenProducto.destroy({ where: { productoId: id } });
        await producto.destroy();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo eliminar el producto');
    }
 
    return true;
};

// ------------------------------------------------------------
//  AGREGAR una o varias imagenes a un producto ya existente
// ------------------------------------------------------------
exports.agregarImagenes = async function (productoId, urls) {
    let producto;
    try {
        producto = await Producto.findByPk(productoId);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar el producto');
    }
    if (!producto) {
        throw new Error('El producto no existe');
    }

    try {
        const cantidadActual = await ImagenProducto.count({ where: { productoId: productoId } });
        const filas = urls.map(function (url, indice) {
            return { productoId: productoId, url: url, orden: cantidadActual + indice };
        });
        await ImagenProducto.bulkCreate(filas);
        return await ImagenProducto.findAll({
            where: { productoId: productoId },
            order: [['orden', 'ASC']]
        });
    } catch (e) {
        console.log(e);
        throw new Error('No se pudieron agregar las imagenes');
    }
};

// ------------------------------------------------------------
//  ELIMINAR una imagen puntual de un producto
// ------------------------------------------------------------
exports.eliminarImagenes = async function (productoId, imagenesIds) {
    let imagenes;
    try {
        imagenes = await ImagenProducto.findAll({
            where: { id: { [Op.in]: imagenesIds }, productoId: productoId }
        });
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar las imagenes');
    }
 
    if (imagenes.length !== imagenesIds.length) {
        throw new Error('Alguna de las imagenes no existe para este producto');
    }
 
    try {
        await ImagenProducto.destroy({
            where: { id: { [Op.in]: imagenesIds }, productoId: productoId }
        });
    } catch (e) {
        console.log(e);
        throw new Error('No se pudieron eliminar las imagenes');
    }
 
    return true;
};

// ------------------------------------------------------------
//  REORDENAR las imagenes de un producto (drag and drop en el frontend)
// ------------------------------------------------------------
// ordenIds: array con los ids de TODAS las imagenes del producto, en el
// orden en el que se quieren mostrar. Ej: [7, 5, 6] deja la imagen 7 primera,
// la 5 segunda y la 6 tercera.
exports.reordenarImagenes = async function (productoId, ordenIds) {
    let imagenes;
    try {
        imagenes = await ImagenProducto.findAll({ where: { productoId: productoId } });
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar las imagenes del producto');
    }

    const idsExistentes = imagenes.map(function (img) { return img.id; });
    const mismaCantidad = ordenIds.length === idsExistentes.length;
    const todosExisten = ordenIds.every(function (id) { return idsExistentes.includes(id); });
    if (!mismaCantidad || !todosExisten) {
        throw new Error('La lista de orden no coincide con las imagenes del producto');
    }

    try {
        for (let indice = 0; indice < ordenIds.length; indice++) {
            await ImagenProducto.update(
                { orden: indice },
                { where: { id: ordenIds[indice] } }
            );
        }
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar el orden de las imagenes');
    }

    return true;
};