const Usuario = require('./Usuario.model');
const Categoria = require('./Categoria.model');
const Producto = require('./Producto.model');
const Consulta = require('./Consulta.model');
const ImagenProducto = require('./ImagenProducto.model');

// --- Relacion Categoria 1..N Producto ---
Categoria.hasMany(Producto, { foreignKey: 'categoriaId' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// --- Relacion Producto 1..N ImagenProducto ---
Producto.hasMany(ImagenProducto, { foreignKey: 'productoId', as: 'imagenes' });
ImagenProducto.belongsTo(Producto, { foreignKey: 'productoId' });

// --- Relacion Producto 1..N Consulta (OPCIONAL) ---
Producto.hasMany(Consulta, { foreignKey: 'productoId' });
Consulta.belongsTo(Producto, { foreignKey: 'productoId' });

// --- Relacion Usuario 1..N Consulta ---
// Toda consulta pertenece a un usuario logueado.
Usuario.hasMany(Consulta, { foreignKey: 'usuarioId' });
Consulta.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = { Categoria, Producto, Consulta, Usuario, ImagenProducto };