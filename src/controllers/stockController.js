const Stock = require('../models/Stock');
const { Supplier } = require('../models/Supplier');
const Service = require('../models/Service');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');

// Listar inventario con filtros
const getStocks = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let where = {};
        if (search) {
            where[Op.or] = [
                { producto: { [Op.like]: `%${search}%` } },
                { codigo: { [Op.like]: `%${search}%` } },
                { '$proveedor.nombre$': { [Op.like]: `%${search}%` } },
                { '$proveedor.razonSocial$': { [Op.like]: `%${search}%` } }
            ];
        }

        const stocks = await Stock.findAndCountAll({
            where,
            include: [{
                model: Supplier,
                as: 'proveedor',
                attributes: ['id', 'nombre', 'razonSocial', 'rif', 'telefono', 'email']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['producto', 'ASC']
            ]
        });

        const responseData = {
            total: stocks.count,
            paginas: Math.ceil(stocks.count / limit),
            paginaActual: parseInt(page),
            datos: stocks.rows || []
        };

        res.json(responseData);
    } catch (error) {
        console.log('Error al obtener el inventario:', error);
        res.status(500).json({
            error: 'Error al obtener el inventario',
            detalles: error.message
        });
    }
};

// Obtener un item de inventario por ID
const getStockById = async (req, res) => {
    try {
        const { id } = req.params;
        const stock = await Stock.findByPk(id, {
            include: [{
                model: Supplier,
                as: 'proveedor',
                attributes: ['id', 'nombre', 'razonSocial', 'rif', 'telefono', 'email']
            }]
        });
        
        if (!stock) {
            return res.status(404).json({
                error: 'Producto no encontrado en el inventario',
                detalles: `No existe un producto con el ID ${id}`
            });
        }

        res.json(stock);
    } catch (error) {
        console.error('Error al obtener producto del inventario:', error);
        res.status(500).json({
            error: 'Error al obtener el producto del inventario',
            detalles: error.message
        });
    }
};

// Crear nuevo item de inventario
const createStock = async (req, res) => {
    try {
        const { cantidad, codigo, precioUnitario, producto, proveedor_id } = req.body;

        // Verificar que todos los campos requeridos estén presentes
        if (!cantidad || !codigo || !precioUnitario || !producto || !proveedor_id) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos',
                detalles: 'Se requieren: cantidad, codigo, precioUnitario, producto y proveedor'
            });
        }

        // Verificar si ya existe un stock con el mismo código
        const stockExists = await Stock.findOne({ where: { codigo } });
        if (stockExists) {
            return res.status(400).json({
                error: 'Ya existe un producto con este código',
                detalles: `El código ${codigo} ya está registrado`
            });
        }

        // Crear el nuevo stock
        const stock = await Stock.create({
            cantidad,
            codigo,
            precioUnitario,
            producto,
            proveedor_id
        });
        
        res.status(201).json(stock);
    } catch (error) {
        console.log('Error al crear el item de inventario:', error);
        res.status(500).json({
            error: 'Error al crear el item de inventario',
            detalles: error.message
        });
    }
};

// Actualizar cantidad de stock
const updateStockQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        
        const stock = await Stock.findByPk(id);
        if (!stock) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado'
            });
        }

        await stock.update({ cantidad });

        // Obtener el stock actualizado con los datos relacionados
        const updatedStock = await Stock.findByPk(id, {
            include: [{
                model: Service,
                as: 'servicio',
                include: [{
                    model: Supplier,
                    as: 'proveedor',
                    attributes: ['id', 'nombre', 'rut']
                }]
            }]
        });

        const plainStock = updatedStock.get({ plain: true });
        res.json({
            ...plainStock,
            stockCritico: updatedStock.isStockCritico()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar la cantidad',
            details: error.message
        });
    }
};

// Actualizar item de inventario completo
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, codigo, precioUnitario, producto, proveedor_id } = req.body;
        
        // Verificar que el producto exista
        const stock = await Stock.findByPk(id);
        if (!stock) {
            return res.status(404).json({
                error: 'Producto no encontrado en el inventario',
                detalles: `No existe un producto con el ID ${id}`
            });
        }

        // Si se proporciona un nuevo código, verificar que no exista ya
        if (codigo && codigo !== stock.codigo) {
            const existingStock = await Stock.findOne({ where: { codigo } });
            if (existingStock) {
                return res.status(400).json({
                    error: 'Código duplicado',
                    detalles: `Ya existe un producto con el código ${codigo}`
                });
            }
        }

        // Actualizar solo los campos proporcionados
        await stock.update({
            cantidad: cantidad || stock.cantidad,
            codigo: codigo || stock.codigo,
            precioUnitario: precioUnitario || stock.precioUnitario,
            producto: producto || stock.producto,
            proveedor_id: proveedor_id || stock.proveedor_id
        });

        // Obtener el stock actualizado
        const updatedStock = await Stock.findByPk(id);
        res.json(updatedStock);
    } catch (error) {
        console.error('Error al actualizar producto del inventario:', error);
        res.status(500).json({
            error: 'Error al actualizar el producto del inventario',
            detalles: error.message
        });
    }
};

// Eliminar item de inventario
const deleteStock = async (req, res) => {
    try {
        const { id } = req.params;
        const stock = await Stock.findByPk(id);
        
        if (!stock) {
            return res.status(404).json({
                error: 'Item de inventario no encontrado'
            });
        }

        await stock.destroy();
        res.json({
            message: 'Item de inventario eliminado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el item de inventario',
            details: error.message
        });
    }
};

module.exports = {
    getStocks,
    getStockById,
    createStock,
    updateStockQuantity,
    updateStock,
    deleteStock
};
