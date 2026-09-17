const nodemailer = require('nodemailer');

// Ethereal es un servicio de mails "de mentira" para probar: crea una cuenta
// de prueba sola (no hace falta Gmail ni ninguna cuenta real) y los mails que
// mandes quedan atrapados en una bandeja de prueba que se ve por un link,
// nunca llegan a un destinatario real.
let transporterPromise = null;

function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = nodemailer.createTestAccount().then(function (cuentaDePrueba) {
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
    return transporterPromise;
}

exports.enviarMailRecuperacion = async function (destinatario, token) {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
        from: '"Dulce Ezeiza" <no-responder@dulce-ezeiza.com>',
        to: destinatario,
        subject: 'Recuperar tu contraseña - Dulce Ezeiza',
        html: `
            <p>Recibimos un pedido para restablecer tu contraseña.</p>
            <p>Este es tu código para hacerlo (vale por 15 minutos):</p>
            <h2>${token}</h2>
            <p>Si vos no pediste esto, ignorá este mensaje.</p>
        `
    });

    // Ethereal no lo manda a ningun lado real: esto te da un link para
    // "abrir" la bandeja de entrada del destinatario y ver como quedo.
    console.log('Mail de recuperacion enviado. Verlo en:', nodemailer.getTestMessageUrl(info));
};