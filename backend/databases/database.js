const { Sequelize } = require('sequelize');

// Crea la instancia de Sequelize con los datos del .env.
// OJO: crear la instancia NO abre la conexion todavia, solo la describe.
// Quien conecta de verdad es sequelize.authenticate() en app.js.
const sequelize = new Sequelize(
    process.env.DB_NAME,       // nombre de la base: DulceEzeiza
    process.env.DB_USER,       // usuario: dulce_user
    process.env.DB_PASSWORD,   // contraseña
    {
        host: process.env.DB_HOST,        // localhost
        dialect: process.env.DB_DIALECT,  // mssql -> Sequelize escribe SQL de SQL Server

        // En desarrollo mostramos el SQL generado (util para aprender/debuggear).
        // En produccion se apaga: no tiene sentido loguear cada query en un
        // servidor real, y evita que datos sensibles terminen en los logs.
        logging: process.env.NODE_ENV === 'production' ? false : console.log,

        dialectOptions: {
            options: {
                // Nombre de la instancia (SQLEXPRESS). Por esto NO usamos DB_PORT:
                // SQL Express usa puertos dinamicos y se resuelve por el nombre de instancia.
                instanceName: process.env.DB_INSTANCE,

                // Equivalen a la casilla "Trust server certificate" de SSMS.
                encrypt: process.env.DB_ENCRYPT === 'true',
                trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
            }
        }
    }
);

// Se exporta una unica instancia. Toda la app comparte la misma conexion.
module.exports = sequelize;