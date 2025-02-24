const Service = require('../models/Service');
const Supplier = require('../models/Supplier');
const { Op } = require('sequelize');

// Listar servicios con paginación, filtros y relación con proveedor
const getServices = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { servicio: { [Op.like]: `%${search}%` } },
                    { descripcion: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const services = await Service.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['servicio', 'ASC']]
        });

        // Si no hay resultados, devolver array vacío
        if (services.count === 0) {
            return res.json({
                total: 0,
                pages: 0,
                currentPage: parseInt(page),
                data: []
            });
        }

        res.json({
            total: services.count,
            pages: Math.ceil(services.count / limit),
            currentPage: parseInt(page),
            data: services.rows
        });
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({
            error: 'Error al obtener los servicios',
            detalles: error.message
        });
    }
};

// Obtener un servicio por ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id, {
            include: [{
                model: Supplier,
                as: 'proveedor',
                attributes: ['id', 'nombre', 'rut', 'email', 'telefono']
            }]
        });
        
        if (!service) {
            return res.status(404).json({
                error: 'Servicio no encontrado'
            });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener el servicio',
            details: error.message
        });
    }
};

// Crear nuevo servicio
const createService = async (req, res) => {
    try {
        const { servicio, descripcion, precio } = req.body;

        // Validar el precio para DECIMAL(10,2)
        if (precio > 9999999.99) {
            return res.status(400).json({
                error: 'Precio inválido',
                detalles: 'El precio excede el límite permitido (DECIMAL(10,2))'
            });
        }

        const service = await Service.create({
            servicio,
            descripcion,
            precio: parseFloat(precio).toFixed(2)
        });

        res.status(201).json({
            mensaje: 'Servicio creado correctamente',
            servicio: service
        });
    } catch (error) {
        console.error('Error al crear el servicio:', error);
        res.status(500).json({
            error: 'Error al crear el servicio',
            detalles: error.message
        });
    }
};

// Actualizar servicio
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { servicio, descripcion, precio } = req.body;

        // Validar que el ID sea un número
        if (!Number.isInteger(parseInt(id))) {
            return res.status(400).json({
                error: 'ID inválido',
                detalles: 'El ID debe ser un número entero'
            });
        }
        
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({
                error: 'Servicio no encontrado',
                detalles: `No existe un servicio con el ID ${id}`
            });
        }

        // Validar el precio para DECIMAL(10,2) si se proporciona
        if (precio && precio > 9999999.99) {
            return res.status(400).json({
                error: 'Precio inválido',
                detalles: 'El precio excede el límite permitido (DECIMAL(10,2))'
            });
        }

        // Construir objeto de actualización solo con campos proporcionados
        const updateData = {};
        if (servicio !== undefined) updateData.servicio = servicio;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (precio !== undefined) updateData.precio = parseFloat(precio).toFixed(2);

        await service.update(updateData);

        // Obtener el servicio actualizado
        const updatedService = await Service.findByPk(id);

        res.json({
            mensaje: 'Servicio actualizado correctamente',
            servicio: updatedService
        });
    } catch (error) {
        console.error('Error al actualizar el servicio:', error);
        res.status(500).json({
            error: 'Error al actualizar el servicio',
            detalles: error.message
        });
    }
};

// Eliminar servicio
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id);
        
        if (!service) {
            return res.status(404).json({
                error: 'Servicio no encontrado'
            });
        }

        await service.destroy();
        res.json({
            message: 'Servicio eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el servicio',
            details: error.message
        });
    }
};

module.exports = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
