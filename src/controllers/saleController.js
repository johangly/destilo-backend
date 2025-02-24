const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Service = require('../models/Service');
const Stock = require('../models/Stock');
const Customer = require('../models/Customer');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');

// Listar ventas con paginación y filtros
const getSales = async (req, res) => {
    console.log('llegando a sales/')
    try {
        // const today = new Date().toISOString().split('T')[0];
        // const { 
        //     page = 1, 
        //     limit = 10, 
        //     fechaInicio = today, 
        //     fechaFin = today 
        // } = req.query;
        // console.log('params: ', { page, limit, fechaInicio, fechaFin })
        // const offset = (page - 1) * limit;

        // let where = {};
        // if (fechaInicio || fechaFin) {
        //     if (fechaInicio) where.fecha = fechaInicio;
        //     if (fechaFin) where.fecha = fechaFin;
        // }
        const sells = await Sale.findAll({
            include: [
                {
                    model: SaleItem,
                    as: 'items',
                    attributes: ['cantidad', 'fecha', 'producto_id', 'nombre', 'precioTotal', 'precioUnitario']
                }
            ],
        });
        // const sales = await Sale.findAndCountAll({
        //     include: [
        //         {
        //             model: SaleItem,
        //             as: 'items',
        //             attributes: ['cantidad', 'fecha', 'producto_id', 'nombre', 'precioTotal', 'precioUnitario']
        //         }
        //     ],
        //     order: [['fecha', 'DESC']]
        // });

        const responseData = {
            total: sells.length,
            datos: Array.isArray(sells) ? sells : []
        };

        console.log('resultado: ', responseData);

        res.json(responseData);
    } catch (error) {
        console.log('error al ejecutar el codigo:',error)
        res.status(500).json({
            error: 'Error al obtener las ventas',
            detalles: error.message
        });
    }
};

// Obtener una venta por ID
const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sale.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'email', 'telefono']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Service,
                        as: 'servicio',
                        attributes: ['id', 'nombre', 'precio']
                    }]
                }
            ]
        });
        
        if (!sale) {
            return res.status(404).json({
                error: 'Venta no encontrada'
            });
        }

        res.json(sale);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener la venta',
            detalles: error.message
        });
    }
};

// Crear nueva venta
const createSale = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { fecha, id_factura, productos } = req.body;
        // Verificar que todos los campos requeridos estén presentes
        if (!fecha || !id_factura || !productos || !productos.length) {
            return res.status(400).json({
                error: 'Datos incompletos',
                detalles: 'Se requieren: fecha, id_factura y al menos un producto'
            });
        }
        // Verificar si ya existe una venta con el mismo id_factura
        const existingVenta = await Sale.findOne({ where: { id_factura } });
        if (existingVenta) {
            return res.status(400).json({
                error: 'Factura duplicada',
                detalles: `Ya existe una venta con el ID de factura ${id_factura}`
            });
        }

        // Verificar y validar todos los productos antes de crear la venta
        for (const producto of productos) {

            if (!producto.cantidad || !producto.codigo || !producto.precioTotal || !producto.precioUnitario) {
                return res.status(400).json({
                    error: 'Datos de producto incompletos',
                    detalles: 'Cada producto debe tener: cantidad, codigo, precioTotal y precioUnitario'
                });
            }

            const stock = await Stock.findOne({ 
                where: { codigo: producto.codigo }
            });

            if (!stock) {
                return res.status(400).json({
                    error: 'Producto no encontrado',
                    detalles: `No existe un producto con el código ${producto.codigo}`
                });
            }

            if (parseInt(stock.cantidad) < parseInt(producto.cantidad)) {
                return res.status(400).json({
                    error: 'Stock insuficiente',
                    detalles: `Stock insuficiente para el producto ${stock.producto}. Disponible: ${stock.cantidad}, Solicitado: ${producto.cantidad}`
                });
            }
        }

        // Crear la venta
        const sale = await Sale.create({
            fecha,
            id_factura
        }, { transaction: t });

        // Crear los productos vendidos y actualizar stock
        const productosVendidos = [];
        for (const producto of productos) {
            const stock = await Stock.findOne({ 
                where: { codigo: producto.codigo },
                transaction: t,
                lock: true // Bloquear el registro para evitar condiciones de carrera
            });

            // Crear el registro de producto vendido
            const productoVendido = await SaleItem.create({
                sell_id: sale.id,
                cantidad: parseInt(producto.cantidad),
                fecha: fecha,
                producto_id: producto.codigo,
                nombre: stock.producto,
                precioTotal: parseFloat(producto.precioTotal).toFixed(2),
                precioUnitario: parseFloat(producto.precioUnitario).toFixed(2)
            }, { transaction: t });

            productosVendidos.push(productoVendido);

            // Actualizar stock
            await stock.update({
                cantidad: (parseInt(stock.cantidad) - parseInt(producto.cantidad)).toString()
            }, { transaction: t });
        }

        await t.commit();

        // Obtener la venta con sus productos
        const ventaCompleta = await Sale.findByPk(sale.id, {
            include: [{
                model: SaleItem,
                as: 'items'
            }]
        });

        res.status(201).json(ventaCompleta);
    } catch (error) {
        console.error('Error al crear la venta:', error);
        await t.rollback();
        res.status(500).json({
            error: 'Error al crear la venta',
            detalles: error.message
        });
    }
};

// Actualizar estado de la venta
const updateSaleStatus = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        const sale = await Sale.findByPk(id, {
            include: [{
                model: SaleItem,
                as: 'items'
            }]
        });

        if (!sale) {
            await t.rollback();
            return res.status(404).json({
                error: 'Venta no encontrada'
            });
        }

        // Si se está cancelando una venta completada, devolver el stock
        if (estado === 'cancelada' && sale.estado === 'completada') {
            for (const item of sale.items) {
                const stock = await Stock.findOne({ 
                    where: { servicio_id: item.servicio_id }
                });
                
                if (stock) {
                    await stock.update({
                        cantidad: stock.cantidad + item.cantidad
                    }, { transaction: t });
                }
            }
        }

        await sale.update({ estado }, { transaction: t });
        await t.commit();

        // Obtener la venta actualizada con sus relaciones
        const updatedSale = await Sale.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'email']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [{
                        model: Service,
                        as: 'servicio',
                        attributes: ['id', 'nombre', 'precio']
                    }]
                }
            ]
        });

        res.json(updatedSale);
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            error: 'Error al actualizar el estado de la venta',
            detalles: error.message
        });
    }
};

module.exports = {
    getSales,
    getSaleById,
    createSale,
    updateSaleStatus
};
