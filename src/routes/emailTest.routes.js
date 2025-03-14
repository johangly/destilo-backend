const express = require('express');
const router = express.Router();
const { sendActivationEmail } = require('../utils/emailService');

router.get('/', async (req, res) => {
    try {

        await sendActivationEmail({email: 'desireevillamizar427@gmail.com', username: 'Test User'},'896a8wdsadasdaw3z');
        
        res.json({
            success: true,
            message: 'Correo de prueba enviado exitosamente'
        });
    } catch (error) {
        console.error('Error en la ruta de prueba de correo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el correo de prueba',
            error: error.message
        });
    }
});

module.exports = router;
