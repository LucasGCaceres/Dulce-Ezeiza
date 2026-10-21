const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Tabla intermedia de la relacion N..N entre Consulta y Producto.
// Cada fila dice "esta consulta menciona este producto".
// No tiene id propio: la clave primaria es el par (consultaId, productoId),
// asi la base misma impide cargar dos veces el mismo producto en una consulta.
const ConsultaProducto = sequelize.define(
    'ConsultaProducto',
    {
        consultaId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        productoId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    },
    {
        tableName: 'ConsultaProductos',
        timestamps: false
    }
);

module.exports = ConsultaProducto;