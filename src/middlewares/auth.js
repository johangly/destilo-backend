const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Ajusta la ruta según tu estructura

const SECRET_KEY = process.env.JWT_SECRET; // Cambia esto por una clave segura

// Función para generar un token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};

// Función para comparar contraseñas
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = { generateToken, comparePassword };