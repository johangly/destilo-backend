const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { validateRequest } = require('../middlewares/validateRequest');
const { requestPasswordReset, resetPassword } = require('../controllers/passwordResetController');

// Validaciones para la solicitud de restablecimiento
const requestResetValidations = [
    body('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe proporcionar un email válido')
        .trim(),
    validateRequest
];

// Validaciones para el restablecimiento de contraseña
const resetPasswordValidations = [
    body('token')
        .notEmpty().withMessage('El token es requerido')
        .isString().withMessage('El token debe ser texto'),
    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña es requerida')
        .isString().withMessage('La contraseña debe ser texto')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// Rutas
router.post('/request', requestResetValidations, requestPasswordReset);
router.put('/reset', resetPasswordValidations, resetPassword);

module.exports = router;
