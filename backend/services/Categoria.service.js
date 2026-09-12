// Importamos el model para hablar con la tabla Categorias.
const Categoria = require('../models/Categoria.model');
const Producto = require('../models/Producto.model');

// ------------------------------------------------------------
//  CREAR una categoria (CREATE)
// ------------------------------------------------------------
exports.crear = async function (datos) {
    try {
        const nuevaCategoria = await Categoria.create({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            activa: datos.activa           // si no viene, la base usa el default (true)
        });
        return nuevaCategoria;
    } catch (e) {
        console.log(e);
        // Si el nombre esta repetido, Sequelize lanza un error de unicidad.
        throw new Error('Error al crear la categoria');
    }
};

// ------------------------------------------------------------
//  LISTAR todas las categorias (READ)
// ------------------------------------------------------------
exports.obtenerTodas = async function () {
    try {
        // findAll sin condiciones trae todas las filas de la tabla.
        const categorias = await Categoria.findAll();
        return categorias;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener las categorias');
    }
};

// ------------------------------------------------------------
//  BUSCAR una categoria por su id (READ)
// ------------------------------------------------------------
exports.obtenerPorId = async function (id) {
    try {
        // findByPk busca por Primary Key (la clave primaria, o sea el id).
        const categoria = await Categoria.findByPk(id);
        return categoria;   // devuelve la categoria, o null si no existe
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener la categoria');
    }
};

// ------------------------------------------------------------
//  EDITAR una categoria (UPDATE)
// ------------------------------------------------------------
exports.editar = async function (id, datos) {
    let categoria;

    try {
        categoria = await Categoria.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la categoria');
    }

    if (!categoria) {
        throw new Error('La categoria no existe');
    }

    categoria.nombre = datos.nombre ?? categoria.nombre;
    categoria.descripcion = datos.descripcion ?? categoria.descripcion;
    categoria.activa = datos.activa ?? categoria.activa;

    try {
        await categoria.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar la categoria');
    }

    return categoria;
};

// ------------------------------------------------------------
//  BORRAR una categoria (DELETE)
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    let categoria;

    try {
        categoria = await Categoria.findByPk(id);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar la categoria');
    }

    if (!categoria) {
        throw new Error('La categoria no existe');
    }

    let cantidadDeProductos;

    try {
        cantidadDeProductos = await Producto.count({ where: { categoriaId: id } });
    } catch (e) {
        console.log(e);
        throw new Error('Error al verificar los productos de la categoria');
    }

    if (cantidadDeProductos > 0) {
        throw new Error('No se puede eliminar la categoria: tiene productos asociados');
    }

    try {
        await categoria.destroy();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo eliminar la categoria');
    }

    return true;
};