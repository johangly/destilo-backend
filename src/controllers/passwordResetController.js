const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendPasswordResetEmail } = require('../utils/emailService');
const sequelize = require('../config/sequelize');

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { email } = req.body;

        // Buscar usuario por email
        const user = await User.findOne({ 
            where: { email },
            transaction
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                message: 'No existe un usuario con este correo electrónico'
            });
        }

        if (user.status !== 'validated') {
            await transaction.rollback();
            return res.status(401).json({
                message: 'Credenciales inválidas'
            });
        }

        // Generar token aleatorio
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1); // Token válido por 1 hora

        // Eliminar tokens anteriores del usuario
        await PasswordResetToken.destroy({
            where: { user_id: user.id },
            transaction
        });

        // Crear nuevo token
        const resetToken = await PasswordResetToken.create({
            token,
            expiration,
            user_id: user.id
        }, { transaction });

        // Enviar email con el token
        await sendPasswordResetEmail(user, token);

        await transaction.commit();

        res.json({
            message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al solicitar restablecimiento de contraseña:', error);
        res.status(500).json({
            message: 'Error al procesar la solicitud de restablecimiento de contraseña'
        });
    }
};

// Validar token y restablecer contraseña
const resetPassword = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { token, newPassword } = req.body;
        // Buscar token válido
        const resetToken = await PasswordResetToken.findOne({
            where: {
                token,
                expiration: {
                    [Op.gt]: new Date() // Token no expirado
                }
            },
            transaction
        });

        if (!resetToken) {
            await transaction.rollback();
            return res.status(400).json({
                message: 'Token inválido o expirado'
            });
        }

        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await User.update(
            { password: hashedPassword },
            { where: { id: resetToken.user_id }, transaction }
        );

        // Eliminar token usado
        await resetToken.destroy({ transaction });

        await transaction.commit();

        res.json({
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            message: 'Error al restablecer la contraseña'
        });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword
};
