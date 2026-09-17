const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Representa la tabla Comercio: SIEMPRE tiene una unica fila (la que
// crea crear-base.sql). No hay "crear otro comercio", solo se edita
// esta fila desde el panel de admin.
const Comercio = sequelize.define(
    'Comercio',
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
            type: DataTypes.STRING(1000)
        },

        direccion: {
            type: DataTypes.STRING(300)
        },

        telefono: {
            type: DataTypes.STRING(50)
        },

        instagram: {
            type: DataTypes.STRING(150)
        },

        facebook: {
            type: DataTypes.STRING(150)
        },

        whatsapp: {
            type: DataTypes.STRING(50)
        },

        tiktok: {
            type: DataTypes.STRING(150)
        },

        horarios: {
            type: DataTypes.STRING(500)
        }
    },
    {
        tableName: 'Comercio',
        timestamps: false
    }
);

module.exports = Comercio;