const express = require('express');
const router = express.Router();
const { 
    getStocks, 
    getStockById, 
    createStock, 
    updateStockQuantity,
    updateStock,
    deleteStock 
} = require('../controllers/stockController');
const { body } = require('express-validator');

// Validaciones
const stockValidations = [
    body('cantidad')
        .notEmpty().withMessage('La cantidad es requerida')
        .isInt().withMessage('La cantidad debe ser un número entero'),
    body('codigo')
        .notEmpty().withMessage('El código es requerido')
        .isString().withMessage('El código debe ser texto')
        .isLength({ max: 50 }).withMessage('El código no puede exceder 50 caracteres'),
    body('precioUnitario')
        .notEmpty().withMessage('El precio unitario es requerido')
        .isString().withMessage('El precio unitario debe ser texto')
        .isLength({ max: 20 }).withMessage('El precio unitario no puede exceder 20 caracteres'),
    body('producto')
        .notEmpty().withMessage('El producto es requerido')
        .isString().withMessage('El producto debe ser texto')
        .isLength({ max: 100 }).withMessage('El producto no puede exceder 100 caracteres'),
    body('proveedor')
        .notEmpty().withMessage('El proveedor es requerido')
        .isString().withMessage('El proveedor debe ser texto')
        .isLength({ max: 100 }).withMessage('El proveedor no puede exceder 100 caracteres')
];

const quantityValidation = [
    body('cantidad')
        .notEmpty().withMessage('La cantidad es requerida')
        .isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero positivo')
];

// Rutas
router.get('/', getStocks);
router.get('/:id', getStockById);
router.post('/', stockValidations, createStock);
router.put('/:id/quantity', quantityValidation, updateStockQuantity);
router.put('/:id', stockValidations, updateStock);
router.delete('/:id', deleteStock);

module.exports = router;
