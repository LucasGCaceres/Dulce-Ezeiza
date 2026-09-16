const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Representa la tabla Consultas de SQL Server.
const Consulta = sequelize.define(
    'Consulta',
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

        email: {
            type: DataTypes.STRING,
            allowNull: false      // NO unique: una persona puede consultar varias veces
        },

        telefono: {
            type: DataTypes.STRING   // opcional
        },

        asunto: {
            type: DataTypes.STRING,
            allowNull: false
        },

        mensaje: {
            type: DataTypes.STRING(2000),
            allowNull: false
        },

        // ENUM: solo acepta uno de estos tres valores. Si intentan guardar
        // otra cosa, Sequelize lo rechaza. Nace como 'pendiente'.
        estado: {
            type: DataTypes.ENUM('pendiente', 'leida', 'respondida'),
            allowNull: false,
            defaultValue: 'pendiente'
        },

        // FK OPCIONAL a Producto (allowNull: true).
        // Si la consulta es general, queda en null.
        productoId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        fecha: {
            type: DataTypes.DATE
        },

        // Quien manda la consulta. OBLIGATORIO (Escenario B: hay que estar logueado).
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        // FK OPCIONAL a Producto (allowNull: true).
        // Si la consulta es general, queda en null.
        productoId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    },
    {
        tableName: 'Consultas',
        timestamps: false
    }
);

module.exports = Consulta;