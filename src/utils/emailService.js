const transporter = require('./emailConfig');

/**
 * Envía un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html - Contenido HTML del correo
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"D-estilo Plus" <no-reply@destilo-plus.com>',
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo enviado exitosamente a:', to);
    } catch (error) {
        console.error('Error al enviar correo:', error);
        throw new Error('Error al enviar el correo electrónico');
    }
};

/**
 * Envía un correo de activación de cuenta
 * @param {Object} user - Datos del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.username - Nombre de usuario
 * @param {string} activationToken - Token de activación
 */
const sendActivationEmail = async (user, activationToken) => {
    const activationUrl = `${process.env.NODE_ENV === 'development' ?
        'http://localhost:3000' : process.env.FRONTEND_URL }/activar-cuenta/${activationToken}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">¡Bienvenido a D-estilo Plus!</h2>
            <p>Hola ${user.username},</p>
            <p>Gracias por registrarte. Para activar tu cuenta, por favor haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${activationUrl}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Activar mi cuenta
                </a>
            </div>
            <p>O copia y pega el siguiente enlace en tu navegador:</p>
            <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
                ${activationUrl}
            </p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no respondas a este mensaje.
            </p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: 'Activa tu cuenta en D-estilo Plus',
        html
    });
};

/**
 * Envía un correo de restablecimiento de contraseña
 * @param {Object} user - Datos del usuario
 * @param {string} user.email - Email del usuario
 * @param {string} user.username - Nombre de usuario
 * @param {string} resetToken - Token de restablecimiento de contraseña
 */
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.NODE_ENV === 'development' ?
        'http://localhost:3000' : process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Restablecimiento de Contraseña - D-estilo Plus</h2>
            <p>Hola ${user.username},</p>
            <p>Has solicitado restablecer tu contraseña. Para continuar, por favor haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                    Restablecer Contraseña
                </a>
            </div>
            <p>O copia y pega el siguiente enlace en tu navegador:</p>
            <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">
                ${resetUrl}
            </p>
            <p>Este enlace expirará en 1 hora por seguridad.</p>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu cuenta está segura.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no respondas a este mensaje.
            </p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: 'Restablece tu contraseña - D-estilo Plus',
        html
    });
};

module.exports = {
    sendEmail,
    sendActivationEmail,
    sendPasswordResetEmail
};
