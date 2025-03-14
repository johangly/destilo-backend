const Customer = require('../models/Customer');
const { Op } = require('sequelize');

// Listar clientes con paginación y filtros
const getCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { cedula: { [Op.like]: `%${search}%` } },
                    { cliente: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { telefono: { [Op.like]: `%${search}%` } },
                    { rif: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const customers = await Customer.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fechaRegistro', 'DESC']]
        });

        // Si no hay resultados, devolver array vacío
        if (customers.count === 0) {
            return res.json({
                total: 0,
                pages: 0,
                currentPage: parseInt(page),
                data: []
            });
        }

        res.json({
            total: customers.count,
            pages: Math.ceil(customers.count / limit),
            currentPage: parseInt(page),
            data: customers.rows
        });
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({
            error: 'Error al obtener los clientes',
            detalles: error.message
        });
    }
};

// Crear nuevo cliente
const createCustomer = async (req, res) => {
    try {
        console.log('entrando al createCustomer')
        const { 
            cedula,
            ciudad,
            cliente,
            direccion,
            email,
            empresa,
            fechaRegistro,
            nrocasa,
            pais,
            provincia,
            rif,
            telefono,
        } = req.body;

        if (!cedula || !cliente || !email) {
            return res.status(400).json({
                error: 'Datos incompletos',
                detalles: 'Se requieren: cedula, cliente, email y telefono'
            });
        }
        console.log('########## cliente: ', cliente)
        const existingCustomer = await Customer.findOne({
            where: {
                [Op.or]: [
                    { cedula },
                    { cliente },
                    { email }
                ]
            }
        });
        console.log('########## cliente exitente: ', existingCustomer)

        if (existingCustomer) {
            res.status(200).json(existingCustomer);
            return;
        }

        const customer = await Customer.create({
            cedula,
            ciudad,
            cliente,
            direccion,
            email,
            empresa,
            fechaRegistro: fechaRegistro || new Date().toISOString(),
            nrocasa,
            pais,
            provincia,
            rif,
            telefono
        });

        res.status(201).json(customer);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'El email ya está registrado',
                detalles: 'Por favor, utilice un email diferente'
            });
        }
        res.status(500).json({
            error: 'Error al crear el cliente',
            detalles: error.message
        });
    }
};

// Eliminar cliente
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('-------------id: ', id)
        // Validar que el ID sea un número
        if (!Number.isInteger(parseInt(id))) {
            return res.status(400).json({
                error: 'ID inválido',
                detalles: 'El ID debe ser un número entero'
            });
        }

        const customer = await Customer.findByPk(id);
        
        if (!customer) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                detalles: `No existe un cliente con el ID ${id}`
            });
        }

        await customer.destroy();

        res.json({
            mensaje: 'Cliente eliminado correctamente',
            detalles: {
                id: customer.id,
                cliente: customer.cliente
            }
        });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({
            error: 'Error al eliminar el cliente',
            detalles: error.message
        });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    deleteCustomer
};
