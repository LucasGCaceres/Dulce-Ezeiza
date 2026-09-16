const { DataTypes } = require('sequelize');
const sequelize = require('../databases/database');

// Representa la tabla Usuarios de SQL Server.
// Los nombres de las columnas coinciden EXACTAMENTE con los de la tabla:
// si no coincidieran, Sequelize fallaria al consultar.
const Usuario = sequelize.define(
    'Usuario',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        nombre: {
            type: DataTypes.STRING,   // NVARCHAR
            allowNull: false          // NOT NULL: obligatorio
        },

        apellido: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true              // no se permiten emails duplicados
        },

        telefono: {
            type: DataTypes.STRING    // sin allowNull: es opcional
        },

        // Se guarda el hash de bcrypt, nunca la contraseña en texto plano.
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        fecha: {
            type: DataTypes.DATE
        },

        rol: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'cliente'
        },
    },
    {
        tableName: 'Usuarios',   // fija el nombre exacto de la tabla
        timestamps: false        // no esperamos columnas createdAt/updatedAt
    }
);

module.exports = Usuario;