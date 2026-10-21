const Usuario = require('./Usuario.model');
const Categoria = require('./Categoria.model');
const Producto = require('./Producto.model');
const Consulta = require('./Consulta.model');
const ImagenProducto = require('./ImagenProducto.model');
const ConsultaProducto = require('./ConsultaProducto.model');
const Novedad = require('./Novedad.model');

// --- Relacion Categoria 1..N Producto ---
Categoria.hasMany(Producto, { foreignKey: 'categoriaId' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// --- Relacion Producto 1..N ImagenProducto ---
Producto.hasMany(ImagenProducto, { foreignKey: 'productoId', as: 'imagenes' });
ImagenProducto.belongsTo(Producto, { foreignKey: 'productoId' });

// --- Relacion Consulta N..N Producto (a traves de ConsultaProductos) ---
// Una consulta puede mencionar varios productos (o ninguno) y un producto
// puede aparecer en muchas consultas. Con el alias 'productos' Sequelize
// genera metodos como consulta.setProductos([1, 5]) y consulta.getProductos().
Consulta.belongsToMany(Producto, {
    through: ConsultaProducto,
    foreignKey: 'consultaId',
    otherKey: 'productoId',
    as: 'productos'
});
Producto.belongsToMany(Consulta, {
    through: ConsultaProducto,
    foreignKey: 'productoId',
    otherKey: 'consultaId',
    as: 'consultas'
});

// --- Relacion Producto 1..N Novedad (opcional del lado de la novedad) ---
// Una novedad puede mencionar un producto (o ninguno). Si se borra el
// producto, la base pone productoId en NULL (ON DELETE SET NULL).
Producto.hasMany(Novedad, { foreignKey: 'productoId' });
Novedad.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = { Categoria, Producto, Consulta, Usuario, ImagenProducto, ConsultaProducto, Novedad };