const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('../models/User');
const ActivationToken = require('../models/ActivationToken');
const { generateToken } = require('../middlewares/auth');
const { sendActivationEmail } = require('../utils/emailService');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'email', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'username', 'role', 'createdAt']
        });
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

// Crear nuevo usuario
const createUser = async (req, res) => {
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
        const { username, password, role, email } = req.body;

        // Verificar si el usuario ya existe por username o email
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }       
                ]
            },
            transaction
        });

        if (existingUser) {
            const field = existingUser.username === username ? 'username' : 'email';
            await transaction.rollback();
            return res.status(400).json({
                message: `El ${field === 'username' ? 'nombre de usuario' : 'email'} ya está en uso`
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario con todos los campos del modelo
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'employee',
            status: 'pending',
            createdAt: new Date()
        }, { transaction });

        // Generar token de activación
        const activationToken = crypto.randomBytes(32).toString('hex');
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24); // Token válido por 24 horas

        // Crear registro de token de activación
        await ActivationToken.create({
            token: activationToken,
            expiration: expirationDate,
            user_id: user.id
        }, { transaction });

        try {
            // Enviar correo de activación
            await sendActivationEmail(user, activationToken);
        } catch (emailError) {
            // Si falla el envío del correo, deshacer la transacción
            await transaction.rollback();
            console.error('Error al enviar el correo de activación:', emailError);
            return res.status(500).json({
                message: 'Error al enviar el correo de activación. No se ha creado la cuenta.'
            });
        }

        // Si todo sale bien, confirmar la transacción
        await transaction.commit();

        res.status(201).json({
            message: 'Usuario creado exitosamente. Por favor, revisa tu correo electrónico para activar tu cuenta.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        // Si ocurre cualquier error, deshacer la transacción
        await transaction.rollback();
        console.error('Error al crear usuario:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Error de validación',
                errors: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Actualizar usuario
const updateUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const userId = req.params.id;

        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Si se está actualizando el username, verificar que no exista
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
            }
            user.username = username;
        }

        // Actualizar contraseña si se proporciona
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Actualizar rol si se proporciona
        if (role) {
            user.role = role;
        }

        await user.save();

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        await user.destroy();
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
