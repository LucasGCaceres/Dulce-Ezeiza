const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Representa la tabla Productos de SQL Server.
const Producto = sequelize.define(
    'Producto',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },

        descripcion: {
            type: DataTypes.STRING
        },

        // DECIMAL para dinero. El (10,2) coincide con la tabla.
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        // Los tres flags (BIT en la tabla = BOOLEAN en Sequelize):
        disponible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        destacado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        // 1 = apto sin TACC, 0 = tiene gluten. Por defecto false (tiene gluten).
        sinGluten: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        // Clave foranea: guarda el id de la categoria a la que pertenece.
        // La relacion en si se define en associations.js (ver abajo).
        categoriaId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        fecha: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: 'Productos',
        timestamps: false
    }
);

module.exports = Producto;