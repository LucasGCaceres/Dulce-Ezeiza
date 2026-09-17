const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Representa la tabla ImagenesProducto: cada fila es UNA foto de UN producto.
const ImagenProducto = sequelize.define(
    'ImagenProducto',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        productoId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },

        // La foto con orden 0 es la que se usa como portada en el catalogo.
        orden: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        tableName: 'ImagenesProducto',
        timestamps: false
    }
);

module.exports = ImagenProducto;