const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool, testConnection } = require('./config/database');

// Inicialización
const app = express();

// Configuración
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Prefijo para todas las rutas
const API_PREFIX = '/destilo';

// Rutas
app.get(`${API_PREFIX}/`, (req, res) => {
    res.json({
        mensaje: 'Bienvenido a la API de D-estilo Plus',
        estado: 'activo',
        version: `NodeJS ${process.versions.node}`
    });
});

// Ruta de prueba para la base de datos
app.get(`${API_PREFIX}/test-db`, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('SELECT 1');
        connection.release();
        
        res.json({
            estado: 'éxito',
            mensaje: 'Conexión a la base de datos establecida correctamente',
        });
    } catch (error) {
        res.status(500).json({
            estado: 'error',
            mensaje: 'Error al conectar con la base de datos',
            error: error.message
        });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Algo salió mal!',
        mensaje: err.message
    });
});

// Iniciar servidor
app.listen(port, async () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    // Probar conexión a la base de datos
    await testConnection();
});
