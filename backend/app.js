// 1. Cargar el .env SIEMPRE PRIMERO, antes de importar database.js.
//    Si no, las variables llegan undefined y la conexion falla.
require('dotenv').config();

// 2. Importar dependencias
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 3. Importar la conexion a la base (ya usa las variables del .env cargadas arriba)
const sequelize = require('./databases/database');

// Cargar las asociaciones entre models (relaciones entre tablas)
require('./models/Associations');

// Importar el router principal de la API
const apiRouter = require('./routes/api');

// 4. Crear la app de Express
const app = express();

// 5. Middlewares base
app.use(express.json());                       // entiende JSON en el body
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: origenesPermitidos }));                  // permite pedidos desde el front (React)

// 6. Ruta de prueba: para confirmar que el servidor responde
app.get('/', (req, res) => {
    res.send('Servidor de Dulce Ezeiza funcionando');
});

// un pedido que no viene del front no llega a ninguna ruta.
app.use('/api', verificarOrigen, apiRouter);

// Lista de origenes del frontend (FRONTEND_URL) + middleware que rechaza el resto
const { origenesPermitidos, verificarOrigen } = require('./middlewares/Origen.middlewares');

// 7. Probar la conexion con la base
sequelize.authenticate()
    .then(() => {
        console.log('Conexion exitosa con SQL Server (base DulceEzeiza)');
    })
    .catch((e) => {
        console.log('Error al conectar con SQL Server:');
        console.log(e);
    });

// 8. Levantar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;