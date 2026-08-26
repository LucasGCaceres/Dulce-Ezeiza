const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Categoría a la que pertenecen los productos (cafetería, tortas, bebidas, sin TACC...).
const Categoria = sequelize.define(
    'Categoria',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        descripcion: {
            type: DataTypes.STRING
        },

        activa: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        fecha: {
            type: DataTypes.DATE
        }
    },
    {
        tableName: 'Categorias',
        timestamps: false
    }
);

module.exports = Categoria;