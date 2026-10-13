// Importamos el model (para hablar con la tabla Usuarios),
// bcrypt (para hashear contraseñas) y jwt (para los tokens).
const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailService = require('./Mail.service');

// ------------------------------------------------------------
//  LOGIN: verificar email + contraseña, devolver token
// ------------------------------------------------------------
exports.login = async function (datos) {
    let usuario;

    try {
        usuario = await Usuario.findOne({ where: { email: datos.email } });
    } catch (e) {
        console.log(e);
        throw new Error('Error al iniciar sesión');
    }

    if (!usuario) {
        throw new Error('Email o contraseña inválidos');
    }

    let token;

    try {
        const passwordValida = bcrypt.compareSync(datos.password, usuario.password);

        if (!passwordValida) {
            throw new Error('Email o contraseña inválidos');
        }

        token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.SECRET,
            { expiresIn: 86400 }
        );
    } catch (e) {
        console.log(e);
        throw new Error('Email o contraseña inválidos');
    }

    const usuarioSeguro = usuario.toJSON();
    delete usuarioSeguro.password;

    return { token: token, usuario: usuarioSeguro };
};

// ------------------------------------------------------------
//  EDITAR PERFIL: el usuario edita sus propios datos
// ------------------------------------------------------------
exports.editarPerfil = async function (usuarioId, datos) {
    try {
        const usuario = await Usuario.findByPk(usuarioId);

        if (!usuario) {
            throw new Error('El usuario no existe');
        }

        usuario.nombre = datos.nombre ?? usuario.nombre;
        usuario.apellido = datos.apellido ?? usuario.apellido;
        usuario.telefono = datos.telefono ?? usuario.telefono;
        usuario.email = datos.email ?? usuario.email;
        // password y rol no se tocan aca a proposito.

        await usuario.save();

        const usuarioSeguro = usuario.toJSON();
        delete usuarioSeguro.password;

        return usuarioSeguro;
    } catch (e) {
        console.log(e);
        throw new Error('Error al actualizar el perfil');
    }
};

// ------------------------------------------------------------
//  CAMBIAR PASSWORD: requiere conocer la actual
// ------------------------------------------------------------
exports.cambiarPassword = async function (usuarioId, passwordActual, passwordNueva) {
    let usuario;

    try {
        usuario = await Usuario.findByPk(usuarioId);
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar el usuario');
    }

    if (!usuario) {
        throw new Error('El usuario no existe');
    }

    const passwordValida = bcrypt.compareSync(passwordActual, usuario.password);

    if (!passwordValida) {
        throw new Error('La contraseña actual es incorrecta');
    }

    usuario.password = bcrypt.hashSync(passwordNueva, 8);

    try {
        await usuario.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar la contraseña');
    }

    return true;
};

// ------------------------------------------------------------
//  BUSCAR un usuario por id (para ver el propio perfil)
// ------------------------------------------------------------
exports.obtenerPorId = async function (usuarioId) {
    try {
        const usuario = await Usuario.findByPk(usuarioId);

        if (!usuario) {
            return null;
        }

        const usuarioSeguro = usuario.toJSON();
        delete usuarioSeguro.password;
        return usuarioSeguro;
    } catch (e) {
        console.log(e);
        throw new Error('Error al obtener el usuario');
    }
};

// ------------------------------------------------------------
//  SOLICITAR RECUPERACION: genera un token y manda el mail
// ------------------------------------------------------------
exports.solicitarRecuperacion = async function (email) {
    const usuario = await Usuario.findOne({ where: { email } });

    // Si no existe, no hacemos nada mas y no avisamos: el controller
    // igual responde el mismo mensaje generico pase lo que pase, asi
    // nadie puede usar este endpoint para averiguar que emails estan
    // registrados (mismo motivo por el que el login no dice cual de
    // los dos datos esta mal).
    if (!usuario) {
        return;
    }

    const codigo = crypto.randomInt(100000, 1000000).toString();
    usuario.resetPasswordToken = codigo;
    usuario.resetPasswordExpira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    await usuario.save();

    await mailService.enviarMailRecuperacion(usuario.email, codigo);
};

// ------------------------------------------------------------
//  RESETEAR PASSWORD: valida el token y cambia la contraseña
// ------------------------------------------------------------
exports.resetearPassword = async function (token, passwordNueva) {
    let usuario;

    try {
        usuario = await Usuario.findOne({ where: { resetPasswordToken: token } });
    } catch (e) {
        console.log(e);
        throw new Error('Error al buscar el usuario');
    }

    const tokenInvalido = !usuario || !usuario.resetPasswordExpira || usuario.resetPasswordExpira < new Date();

    if (tokenInvalido) {
        throw new Error('El código de recuperación es inválido o venció');
    }

    usuario.password = bcrypt.hashSync(passwordNueva, 8);
    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpira = null;

    try {
        await usuario.save();
    } catch (e) {
        console.log(e);
        throw new Error('No se pudo actualizar la contraseña');
    }

    return true;
};