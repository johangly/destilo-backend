const User = require('../models/User');
const { comparePassword, generateToken } = require('../middlewares/auth');
const { validationResult } = require('express-validator');

const login = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Buscar el usuario
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar la contraseña
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = generateToken(user);

        // Enviar respuesta
        res.json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt
            },
            token
        });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    login
};
