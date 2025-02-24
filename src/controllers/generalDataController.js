const GeneralData = require('../models/GeneralData');

// Obtener datos generales
const getGeneralData = async (req, res) => {
    try {
        const data = await GeneralData.findOne();
        if (!data) {
            return res.status(404).json({
                error: 'No se encontraron datos generales'
            });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los datos generales',
            detalles: error.message
        });
    }
};

// Crear o actualizar datos generales
const upsertGeneralData = async (req, res) => {
    try {
        const {
            nombre_negocio,
            descripcion,
            direccion,
            telefono,
            email,
            horario,
            redes_sociales,
            logo_url,
            configuracion
        } = req.body;

        // Buscar datos existentes
        let data = await GeneralData.findOne();

        if (data) {
            // Actualizar datos existentes
            await data.update({
                nombre_negocio,
                descripcion,
                direccion,
                telefono,
                email,
                horario: horario || data.horario,
                redes_sociales: redes_sociales || data.redes_sociales,
                logo_url: logo_url || data.logo_url,
                configuracion: {
                    ...data.configuracion,
                    ...configuracion
                }
            });
        } else {
            // Crear nuevos datos
            data = await GeneralData.create({
                nombre_negocio,
                descripcion,
                direccion,
                telefono,
                email,
                horario,
                redes_sociales,
                logo_url,
                configuracion
            });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar los datos generales',
            detalles: error.message
        });
    }
};

// Actualizar configuración específica
const updateConfig = async (req, res) => {
    try {
        const { configuracion } = req.body;
        
        let data = await GeneralData.findOne();
        if (!data) {
            return res.status(404).json({
                error: 'No se encontraron datos generales'
            });
        }

        const updatedConfig = {
            ...data.configuracion,
            ...configuracion
        };

        await data.update({ configuracion: updatedConfig });
        
        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar la configuración',
            detalles: error.message
        });
    }
};

// Actualizar horario
const updateSchedule = async (req, res) => {
    try {
        const { horario } = req.body;
        
        let data = await GeneralData.findOne();
        if (!data) {
            return res.status(404).json({
                error: 'No se encontraron datos generales'
            });
        }

        const updatedSchedule = {
            ...data.horario,
            ...horario
        };

        await data.update({ horario: updatedSchedule });
        
        res.json(data);
    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar el horario',
            detalles: error.message
        });
    }
};

module.exports = {
    getGeneralData,
    upsertGeneralData,
    updateConfig,
    updateSchedule
};
