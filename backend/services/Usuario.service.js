// Importamos el model (para hablar con la tabla Usuarios),
// bcrypt (para hashear contraseñas) y jwt (para los tokens).
const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ------------------------------------------------------------
//  REGISTRAR un usuario nuevo
// ------------------------------------------------------------
// Recibe un objeto con los datos ya limpios (nombre, apellido, etc.).
// NO recibe req ni res: el service no sabe nada de HTTP.
exports.registrar = async function (datos) {
    try {
        // Hasheamos la contraseña antes de guardarla.
        // NUNCA se guarda la contraseña en texto plano, solo su hash.
        // El 8 es el "costo": cuantas vueltas de encriptado (mas alto = mas seguro y lento).
        const passwordHasheada = bcrypt.hashSync(datos.password, 8);

        // Creamos el usuario en la base. Sequelize traduce esto a un INSERT.
        const nuevoUsuario = await Usuario.create({
            nombre: datos.nombre,
            apellido: datos.apellido,
            email: datos.email,
            telefono: datos.telefono,
            password: passwordHasheada  // guardamos el hash, no el original
        });

        // Firmamos un token con el id del usuario recien creado.
        // El token es la "credencial" que despues prueba quien es.
        const token = jwt.sign(
            { id: nuevoUsuario.id },
            process.env.SECRET,
            { expiresIn: 86400 }          // dura 86400 segundos = 24 horas
        );

        return token;

    } catch (e) {
        console.log(e);
        throw new Error('Error al registrar el usuario');
    }
};

// ------------------------------------------------------------
//  LOGIN: verificar email + contraseña, devolver token
// ------------------------------------------------------------
exports.login = async function (datos) {
    try {
        // Buscamos el usuario por su email. findOne devuelve uno o null.
        const usuario = await Usuario.findOne({
            where: { email: datos.email }
        });

        // Si no existe ningun usuario con ese email, error.
        if (!usuario) {
            throw new Error('Email o contraseña inválidos');
        }

        // Comparamos la contraseña que mandaron contra el hash guardado.
        // bcrypt sabe comparar el texto plano con el hash sin "des-hashear".
        const passwordValida = bcrypt.compareSync(datos.password, usuario.password);

        if (!passwordValida) {
            throw new Error('Email o contraseña inválidos');
        }

        // Si todo esta bien, firmamos y devolvemos un token nuevo.
        const token = jwt.sign(
            { id: usuario.id },
            process.env.SECRET,
            { expiresIn: 86400 }
        );

        return { token: token, usuario: usuario };

    } catch (e) {
        console.log(e);
        throw new Error(e.message);
    }
};