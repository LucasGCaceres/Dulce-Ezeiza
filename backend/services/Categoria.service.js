// Importamos el model para hablar con la tabla Categorias.
const Categoria = require('../models/Categoria.model');

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
    try {
        // Primero buscamos la categoria que se quiere editar.
        const categoria = await Categoria.findByPk(id);

        // Si no existe, avisamos.
        if (!categoria) {
            throw new Error('La categoria no existe');
        }

        // Actualizamos solo los campos que llegaron (si no llega uno, deja el que ya tenia).
        categoria.nombre = datos.nombre ?? categoria.nombre;
        categoria.descripcion = datos.descripcion ?? categoria.descripcion;
        categoria.activa = datos.activa ?? categoria.activa;

        // save() guarda los cambios en la base (genera un UPDATE).
        await categoria.save();
        return categoria;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};

// ------------------------------------------------------------
//  BORRAR una categoria (DELETE)
// ------------------------------------------------------------
exports.eliminar = async function (id) {
    try {
        const categoria = await Categoria.findByPk(id);

        if (!categoria) {
            throw new Error('La categoria no existe');
        }

        // destroy() borra la fila de la base (genera un DELETE).
        await categoria.destroy();
        return true;
    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};