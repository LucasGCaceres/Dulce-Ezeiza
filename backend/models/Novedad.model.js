const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Representa la tabla Novedades: noticias/anuncios del local (promos,
// fechas especiales, productos nuevos). Se crean como borrador y el admin
// decide cuando publicarlas.
const Novedad = sequelize.define(
    'Novedad',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        titulo: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        // Texto corto que se ve en las tarjetas del listado.
        resumen: {
            type: DataTypes.STRING(300),
            allowNull: false
        },

        // Texto completo del detalle. NVARCHAR(MAX) en la tabla.
        contenido: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        // Una sola imagen, como URL (igual criterio que ImagenesProducto).
        imagenUrl: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        // Si no se manda, se usa el momento actual.
        fechaPublicacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        // false = borrador (no la ve el publico).
        publicada: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

        // Producto relacionado, opcional. La relacion se define en Associations.js.
        productoId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: 'Novedades',
        timestamps: false
    }
);

module.exports = Novedad;