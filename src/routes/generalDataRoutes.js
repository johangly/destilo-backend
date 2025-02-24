const express = require('express');
const router = express.Router();
const { 
    getGeneralData, 
    upsertGeneralData, 
    updateConfig, 
    updateSchedule 
} = require('../controllers/generalDataController');
const { body } = require('express-validator');

// Validaciones
const generalDataValidations = [
    body('nombre_negocio')
        .notEmpty().withMessage('El nombre del negocio es requerido'),
    body('direccion')
        .notEmpty().withMessage('La dirección es requerida'),
    body('telefono')
        .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
        .withMessage('Formato de teléfono inválido'),
    body('email')
        .isEmail().withMessage('Email inválido'),
    body('horario')
        .optional()
        .isObject().withMessage('Formato de horario inválido'),
    body('redes_sociales')
        .optional()
        .isObject().withMessage('Formato de redes sociales inválido'),
    body('configuracion')
        .optional()
        .isObject().withMessage('Formato de configuración inválido')
];

const configValidations = [
    body('configuracion')
        .isObject().withMessage('Formato de configuración inválido'),
    body('configuracion.moneda')
        .optional()
        .isString().withMessage('Moneda debe ser una cadena de texto'),
    body('configuracion.zona_horaria')
        .optional()
        .isString().withMessage('Zona horaria debe ser una cadena de texto'),
    body('configuracion.impuesto')
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Impuesto debe ser un número entre 0 y 100'),
    body('configuracion.requiere_cita')
        .optional()
        .isBoolean().withMessage('requiere_cita debe ser un valor booleano')
];

const scheduleValidations = [
    body('horario')
        .isObject().withMessage('Formato de horario inválido'),
    body('horario.*.apertura')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato de hora de apertura inválido (HH:MM)'),
    body('horario.*.cierre')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Formato de hora de cierre inválido (HH:MM)')
];

// Rutas
router.get('/', getGeneralData);
router.put('/', generalDataValidations, upsertGeneralData);
router.patch('/config', configValidations, updateConfig);
router.patch('/schedule', scheduleValidations, updateSchedule);

module.exports = router;
