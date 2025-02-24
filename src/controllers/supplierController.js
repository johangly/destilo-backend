const { Supplier } = require('../models/Supplier');
const { Op } = require('sequelize');

// Listar proveedores con paginación y filtros
const getSuppliers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { nombre: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { rif: { [Op.like]: `%${search}%` } },
                    { razonSocial: { [Op.like]: `%${search}%` } },
                    { telefono: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const suppliers = await Supplier.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fechaRegistro', 'DESC']],
            attributes: [
                'id',
                'cargo',
                'email',
                'fechaRegistro',
                'nombre',
                'productos',
                'razonSocial',
                'rif',
                'servicios',
                'telefono',
                'webrrss'
            ]
        });

        // Si no hay resultados, devolver array vacío
        if (suppliers.count === 0) {
            return res.json({
                total: 0,
                pages: 0,
                currentPage: parseInt(page),
                data: []
            });
        }

        res.json({
            total: suppliers.count,
            pages: Math.ceil(suppliers.count / limit),
            currentPage: parseInt(page),
            data: suppliers.rows
        });
    } catch (error) {
        console.error('Error al obtener los proveedores:', error);
        res.status(500).json({
            error: 'Error al obtener los proveedores',
            detalles: error.message
        });
    }
};

// Obtener un proveedor por ID
const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByPk(id);
        
        if (!supplier) {
            return res.status(404).json({
                error: 'Proveedor no encontrado'
            });
        }

        res.json(supplier);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener el proveedor',
            details: error.message
        });
    }
};

// Crear nuevo proveedor
const createSupplier = async (req, res) => {
    try {
        const {
            nombre,
            email,
            telefono,
            rif,
            razonSocial,
            cargo,
            productos,
            servicios,
            webrrss
        } = req.body;

        const supplier = await Supplier.create({
            nombre,
            email,
            telefono,
            rif,
            razonSocial,
            cargo,
            productos,
            servicios,
            webrrss,
            fechaRegistro: new Date().toISOString()
        });

        res.status(201).json(supplier);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            error: 'Error al crear el proveedor',
            detalles: error.message
        });
    }
};

// Actualizar proveedor
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, telefono, direccion, rut, giro } = req.body;
        
        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            return res.status(404).json({
                error: 'Proveedor no encontrado'
            });
        }

        await supplier.update({
            nombre,
            email,
            telefono,
            direccion,
            rut,
            giro
        });

        res.json(supplier);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'El email o RUT ya está registrado'
            });
        }
        res.status(500).json({
            error: 'Error al actualizar el proveedor',
            details: error.message
        });
    }
};

// Eliminar proveedor
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByPk(id);
        
        if (!supplier) {
            return res.status(404).json({
                error: 'Proveedor no encontrado'
            });
        }

        await supplier.destroy();
        res.json({
            message: 'Proveedor eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el proveedor',
            details: error.message
        });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
