const express = require('express');
const router = express.Router();
const { 
    getServices, 
    getServiceById, 
    createService, 
    updateService, 
    deleteService 
} = require('../controllers/serviceController');
const { body } = require('express-validator');

// Validaciones
const serviceValidations = [
    body('servicio')
        .notEmpty().withMessage('El nombre del servicio es requerido')
        .isLength({ max: 100 }).withMessage('El nombre del servicio no debe exceder los 100 caracteres'),
    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser texto'),
    body('precio')
        .notEmpty().withMessage('El precio es requerido')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
        .custom((value) => {
            if (value > 9999999.99) {
                throw new Error('El precio excede el límite permitido (DECIMAL(10,2))');
            }
            return true;
        })
];

// Rutas
router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', serviceValidations, createService);
router.put('/:id', serviceValidations, updateService);
router.delete('/:id', deleteService);

module.exports = router;
