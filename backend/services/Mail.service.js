const nodemailer = require('nodemailer');

// ------------------------------------------------------------
//  Que casilla se usa para mandar los mails
// ------------------------------------------------------------
// - Si en el .env estan MAIL_USER y MAIL_PASS, se manda con esa casilla REAL
//   (por defecto Gmail) y el mail le llega de verdad al destinatario.
// - Si no estan, se usa Ethereal: un servicio de mails "de mentira" para
//   probar. Crea una cuenta de prueba solo y los mails quedan atrapados en
//   una bandeja que se ve por un link; nunca llegan a nadie.
// Asi el proyecto sigue andando aunque alguien no tenga la clave del mail.

function hayMailReal() {
    return Boolean(process.env.MAIL_USER && process.env.MAIL_PASS);
}

let transporterPromise = null;

function crearTransporterReal() {
    const puerto = Number(process.env.MAIL_PORT) || 465;
    return nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: puerto,
        secure: puerto === 465,   // 465 va encriptado de entrada; 587 se encripta despues
        auth: {
            user: process.env.MAIL_USER,
            // Google muestra la clave con espacios ("abcd efgh ijkl mnop"): se los sacamos.
            pass: process.env.MAIL_PASS.replace(/\s/g, '')
        }
    });
}

function crearTransporterDePrueba() {
    return nodemailer.createTestAccount().then(function (cuentaDePrueba) {
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: cuentaDePrueba.user,
                pass: cuentaDePrueba.pass
            }
        });
    });
}

function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = (hayMailReal()
            ? Promise.resolve(crearTransporterReal())
            : crearTransporterDePrueba())
            .catch(function (e) {
                // Si falla, no dejamos guardada la promesa rota: asi el
                // proximo pedido vuelve a intentar desde cero en vez de
                // fallar para siempre hasta reiniciar el servidor.
                transporterPromise = null;
                throw e;
            });
    }
    return transporterPromise;
}

exports.enviarMailRecuperacion = async function (destinatario, token) {
    const transporter = await getTransporter();

    const remitente = hayMailReal()
        ? '"Dulce Ezeiza" <' + process.env.MAIL_USER + '>'
        : '"Dulce Ezeiza" <no-responder@dulce-ezeiza.com>';

    const info = await transporter.sendMail({
        from: remitente,
        to: destinatario,
        subject: 'Recuperar tu contraseña - Dulce Ezeiza',
        html: `
            <p>Recibimos un pedido para restablecer tu contraseña.</p>
            <p>Este es tu código para hacerlo (vale por 15 minutos):</p>
            <h2>${token}</h2>
            <p>Si vos no pediste esto, ignorá este mensaje.</p>
        `
    });

    if (hayMailReal()) {
        // No se loguea el codigo: es la "llave" para cambiar la contraseña.
        console.log('Mail de recuperacion enviado a', destinatario);
    } else {
        // Ethereal no lo manda a ningun lado real: esto te da un link para
        // "abrir" la bandeja de entrada del destinatario y ver como quedo.
        console.log('Mail de recuperacion (de prueba). Verlo en:', nodemailer.getTestMessageUrl(info));
    }
};