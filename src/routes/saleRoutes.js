const express = require('express');
const router = express.Router();
const { 
    getSales, 
    getSaleById, 
    createSale, 
    updateSaleStatus 
} = require('../controllers/saleController');
const { body } = require('express-validator');

// Validaciones para la venta
const createSaleValidations = [
    body('fecha')
        .notEmpty().withMessage('La fecha es requerida')
        .isString().withMessage('La fecha debe ser texto')
        .isLength({ max: 50 }).withMessage('La fecha no puede exceder 50 caracteres'),
    body('id_factura')
        .notEmpty().withMessage('El ID de factura es requerido')
        .isInt().withMessage('El ID de factura debe ser un número entero'),
    body('customer_id')
        .notEmpty().withMessage('El ID del cliente es requerido')
        .isInt().withMessage('El ID del cliente debe ser un número entero'),
    body('productos')
        .isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('productos.*.cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
    body('productos.*.producto_id')
        .notEmpty().withMessage('El ID del producto es requerido')
        .isString().withMessage('El ID del producto debe ser texto')
        .isLength({ max: 50 }).withMessage('El ID del producto no puede exceder 50 caracteres'),
    body('productos.*.nombre')
        .notEmpty().withMessage('El nombre del producto es requerido')
        .isString().withMessage('El nombre del producto debe ser texto')
        .isLength({ max: 100 }).withMessage('El nombre del producto no puede exceder 100 caracteres'),
    body('productos.*.precioTotal')
        .notEmpty().withMessage('El precio total es requerido')
        .isDecimal().withMessage('El precio total debe ser un número decimal'),
    body('productos.*.precioUnitario')
        .notEmpty().withMessage('El precio unitario es requerido')
        .isDecimal().withMessage('El precio unitario debe ser un número decimal')
];

const updateStatusValidation = [
    body('estado')
        .isIn(['pendiente', 'completada', 'cancelada']).withMessage('Estado inválido')
];

// Rutas
router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSaleValidations, createSale);
router.put('/:id/status', updateStatusValidation, updateSaleStatus);

module.exports = router;
