const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, deleteCustomer } = require('../controllers/customerController');
const { body, query } = require('express-validator');

// Validaciones
const createValidations = [
    body('cedula').notEmpty().withMessage('La cédula es requerida')
        .isLength({ min: 1, max: 20 }).withMessage('La cédula debe tener entre 1 y 20 caracteres'),
    body('ciudad').notEmpty().withMessage('La ciudad es requerida')
        .isLength({ min: 1, max: 100 }).withMessage('La ciudad debe tener entre 1 y 100 caracteres'),
    body('cliente').notEmpty().withMessage('El nombre del cliente es requerido')
        .isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
    body('direccion').notEmpty().withMessage('La dirección es requerida')
        .isLength({ min: 1, max: 255 }).withMessage('La dirección debe tener entre 1 y 255 caracteres'),
    body('email').optional().isEmail().withMessage('El formato del email es inválido')
        .isLength({ max: 100 }).withMessage('El email debe tener máximo 100 caracteres'),
    body('empresa').optional()
        .isLength({ max: 100 }).withMessage('La empresa debe tener máximo 100 caracteres'),
    body('fechaRegistro').notEmpty().withMessage('La fecha de registro es requerida')
        .isLength({ max: 50 }).withMessage('La fecha de registro debe tener máximo 50 caracteres'),
    body('nrocasa').optional()
        .isLength({ max: 50 }).withMessage('El número de casa debe tener máximo 50 caracteres'),
    body('pais').notEmpty().withMessage('El país es requerido')
        .isLength({ max: 100 }).withMessage('El país debe tener máximo 100 caracteres'),
    body('provincia').notEmpty().withMessage('La provincia es requerida')
        .isLength({ max: 100 }).withMessage('La provincia debe tener máximo 100 caracteres'),
    body('rif').optional()
        .isLength({ max: 20 }).withMessage('El RIF debe tener máximo 20 caracteres'),
    body('teléfono').optional()
        .isLength({ max: 20 }).withMessage('El teléfono debe tener máximo 20 caracteres')
];

// Rutas
router.get('/', getCustomers);
router.post('/', createValidations, createCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
