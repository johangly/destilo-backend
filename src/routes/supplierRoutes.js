const express = require('express');
const router = express.Router();
const { 
    getSuppliers, 
    getSupplierById, 
    createSupplier, 
    updateSupplier, 
    deleteSupplier 
} = require('../controllers/supplierController');
const { body } = require('express-validator');

// Validaciones
const supplierValidations = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('rif').notEmpty().withMessage('El RIF es requerido'),
    body('razonSocial').notEmpty().withMessage('La razón social es requerida'),
    body('fechaRegistro').notEmpty().withMessage('La fecha de registro es requerida'),
    body('cargo').optional(),
    body('productos').optional(),
    body('servicios').optional(),
    body('telefono').optional(),
    body('webrrss').optional()
];

// Rutas
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', supplierValidations, createSupplier);
router.put('/:id', supplierValidations, updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
