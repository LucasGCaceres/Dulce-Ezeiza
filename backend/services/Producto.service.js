const Producto = require('../models/Producto.model');
const Categoria = require('../models/Categoria.model');
const { Op } = require('sequelize');   // Op = operadores (LIKE, mayor que, etc.)

// ------------------------------------------------------------
//  CREAR un producto
// ------------------------------------------------------------
exports.crear = async function (datos) {
    try {
        const nuevoProducto = await Producto.create({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio: datos.precio,
            categoriaId: datos.categoriaId,
            disponible: datos.disponible,
            destacado: datos.destacado,
            sinGluten: datos.sinGluten
        });
        return nuevoProducto;
    } catch (e) {
        console.log(e);
        throw new Error('Error al crear el producto');
    }
};

// ------------------------------------------------------------
//  LISTAR productos con busqueda y filtros (para el catalogo)
// ------------------------------------------------------------
// Recibe un objeto 'filtros' opcional: { busqueda, categoriaId, soloActivos }
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

        // Filtro por aptos sin TACC.
        if (filtros.sinGluten) {
            where.sinGluten = true;
        }

        const productos = await Producto.findAll({
            where: where,
            // include: trae la categoria de cada producto en la misma consulta.
            include: [{ model: Categoria }]
        });

        return productos;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener los productos');
    }
};

// ------------------------------------------------------------
//  BUSCAR un producto por id (con su categoria)
// ------------------------------------------------------------
exports.obtenerPorId = async function (id) {
    try {
        const producto = await Producto.findByPk(id, {
            include: [{ model: Categoria }]
        });
        return producto;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener el producto');
    }
};

// ------------------------------------------------------------
//  EDITAR un producto
// ------------------------------------------------------------
exports.editar = async function (id, datos) {
    try {
        const producto = await Producto.findByPk(id);
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

        await producto.save();
        return producto;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};

// ------------------------------------------------------------
//  ELIMINAR un producto
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) {
            throw new Error('El producto no existe');
        }
        await producto.destroy();
        return true;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};