// Define las relaciones entre los models de Sequelize.
// Se importa UNA vez al arrancar la app (desde app.js), despues de la conexion.

const Categoria = require('./Categoria.model');
const Producto = require('./Producto.model');

// --- Relacion Categoria 1..N Producto ---
// Una categoria tiene muchos productos.
Categoria.hasMany(Producto, { foreignKey: 'categoriaId' });
// Cada producto pertenece a una categoria.
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// Exportamos los models ya relacionados por si hacen falta juntos.
module.exports = { Categoria, Producto };