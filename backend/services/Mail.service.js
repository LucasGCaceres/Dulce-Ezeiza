const nodemailer = require('nodemailer');

// Transporter con una casilla de correo real (Gmail), configurada por
// variables de entorno. Ver .env.example para saber que datos completar.
let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    }
    return transporter;
}

exports.enviarMailRecuperacion = async function (destinatario, token) {
    const transporter = getTransporter();

    // OJO: el "from" tiene que ser la misma casilla autenticada en MAIL_USER.
    // Gmail rechaza -o marca como sospechoso- un mail cuyo remitente no coincide con la 
    // cuenta que inicio sesion. Por eso ya no podemos inventar un remitente como haciamos antes.
    await transporter.sendMail({
        from: `"Dulce Ezeiza" <${process.env.MAIL_USER}>`,
        to: destinatario,
        subject: 'Recuperar tu contraseña - Dulce Ezeiza',
        html: `
            <p>Recibimos un pedido para restablecer tu contraseña.</p>
            <p>Este es tu código para hacerlo (vale por 15 minutos):</p>
            <h2>${token}</h2>
            <p>Si vos no pediste esto, ignorá este mensaje.</p>
        `
    });

    console.log('Mail de recuperacion enviado a', destinatario);
};