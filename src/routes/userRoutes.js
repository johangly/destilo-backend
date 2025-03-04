const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} = require('../controllers/userController');
const { body } = require('express-validator');

// Validaciones para la creacion de un usuario
const createUserValidations = [
    body('username')
        .notEmpty().withMessage('El nombre de usuario es requerido')
        .isString().withMessage('El nombre de usuario debe ser texto')
        .custom(async (value) => {
            const userExists = await User.findOne({ where: { username: value } });
            if (userExists) {
                throw new Error('El nombre de usuario ya está en uso');
            }
            return true;
        }),
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isString().withMessage('La contraseña debe ser texto')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role')
        .optional()
        .isIn(['admin', 'employee']).withMessage('El rol debe ser admin o employee')
];

// Validaciones para la actualizacion de un usuario
const updateUserValidations = [
    body('username')
        .optional()
        .isString().withMessage('El nombre de usuario debe ser texto')
        .custom(async (value) => {
            const userExists = await User.findOne({ where: { username: value } });
            if (userExists) {
                throw new Error('El nombre de usuario ya está en uso');
            }
            return true;
        }),
    body('role')
        .optional()
        .isIn(['admin', 'employee']).withMessage('El rol debe ser admin o employee')
];

// Rutas
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidations, createUser);
router.put('/:id', updateUserValidations, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
