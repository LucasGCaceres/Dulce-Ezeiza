// Define las relaciones entre los models de Sequelize.
// Se importa UNA vez al arrancar la app (desde app.js), despues de la conexion.

const Categoria = require('./Categoria.model');
const Producto = require('./Producto.model');
const Consulta = require('./Consulta.model');

// --- Relacion Categoria 1..N Producto ---
Categoria.hasMany(Producto, { foreignKey: 'categoriaId' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// --- Relacion Producto 1..N Consulta (OPCIONAL) ---
// Un producto puede tener muchas consultas; una consulta puede pertenecer
// a un producto o a ninguno (productoId null = consulta general).
Producto.hasMany(Consulta, { foreignKey: 'productoId' });
Consulta.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = { Categoria, Producto, Consulta };