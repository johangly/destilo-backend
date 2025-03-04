const express = require('express');
const router = express.Router();
const { 
    login 
} = require('../controllers/loginController');
const { body } = require('express-validator');

// Validaciones para la creacion de un usuario
const loginValidation = [
    body('username')
        .notEmpty().withMessage('El nombre de usuario es requerido')
        .isString().withMessage('El nombre de usuario debe ser texto'),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isString().withMessage('La contraseña debe ser texto')
];

// Rutas
router.post('/', loginValidation, login);

module.exports = router;
