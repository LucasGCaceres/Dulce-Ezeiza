// El controller traduce HTTP: lee req, llama al service, responde con res.
// NO tiene logica de negocio (esa vive en el service) ni SQL.
const usuarioService = require('../services/usuario.service');

// ------------------------------------------------------------
//  REGISTRAR: POST /api/usuarios/registro
// ------------------------------------------------------------
exports.registrar = async function (req, res) {
    // Leemos del body los datos que mando el cliente.
    const datos = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        email: req.body.email,
        telefono: req.body.telefono,
        password: req.body.password
    };

    // Validacion minima en el backend: campos obligatorios presentes.
    // (La consigna exige validar en front Y en back.)
    if (!datos.nombre || !datos.apellido || !datos.email || !datos.password) {
        return res.status(400).json({
            mensaje: 'Faltan datos obligatorios: nombre, apellido, email y password'
        });
    }

    try {
        // Llamamos al service con datos limpios. El service no ve req ni res.
        const token = await usuarioService.registrar(datos);

        // 201 = "Created". Se creo un recurso nuevo.
        return res.status(201).json({
            token: token,
            mensaje: 'Usuario registrado correctamente'
        });
    } catch (e) {
        // 400 = error del lado del cliente (ej: email repetido).
        return res.status(400).json({ mensaje: e.message });
    }
};

// ------------------------------------------------------------
//  LOGIN: POST /api/usuarios/login
// ------------------------------------------------------------
exports.login = async function (req, res) {
    const datos = {
        email: req.body.email,
        password: req.body.password
    };

    if (!datos.email || !datos.password) {
        return res.status(400).json({
            mensaje: 'Faltan email o password'
        });
    }

    try {
        // El service devuelve { token, usuario }. Lo dividimos.
        const { token, usuario } = await usuarioService.login(datos);

        // 200 = OK. Devolvemos el token y algunos datos del usuario.
        return res.status(200).json({
            token: token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            },
            mensaje: 'Login exitoso'
        });
    } catch (e) {
        // 401 = "Unauthorized". Credenciales invalidas.
        return res.status(401).json({ mensaje: e.message });
    }
};