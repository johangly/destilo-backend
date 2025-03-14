const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/sequelize');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const stockRoutes = require('./routes/stockRoutes');
const saleRoutes = require('./routes/saleRoutes');
const generalDataRoutes = require('./routes/generalDataRoutes');
const loginRoutes = require('./routes/loginRoutes');
const userRoutes = require('./routes/userRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const emailTestRoutes = require('./routes/emailTest.routes');
const tokenValidationRoutes = require('./routes/tokenValidationRoutes');

// Inicialización
const app = express();

// Configuración
const port = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/destilo';

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas principales
app.get(API_PREFIX, (req, res) => {
    console.log(API_PREFIX,'entrando al endpoint principal');
    res.json({
        mensaje: 'Bienvenido a la API de D-estilo Plus',
        estado: 'activo',
        version: `NodeJS ${process.versions.node}`
    });
});

// Rutas de la API
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/suppliers`, supplierRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/stocks`, stockRoutes);
app.use(`${API_PREFIX}/sells`, saleRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/general`, generalDataRoutes);
app.use(`${API_PREFIX}/login`, loginRoutes);
app.use(`${API_PREFIX}/reset-password`, passwordResetRoutes);
app.use(`${API_PREFIX}/email-test`, emailTestRoutes);
app.use(`${API_PREFIX}/token-validation`, tokenValidationRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: err.message
    });
});

// Iniciar servidor y base de datos
sequelize.authenticate()
    .then(() => {
        console.log('Conexión a la base de datos establecida correctamente');
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
            console.log(`API disponible en http://localhost:${port}${API_PREFIX}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err);
    });