const { literal } = require('sequelize');
const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const SaleService = require('../models/SaleService');
const Service = require('../models/Service');
const Stock = require('../models/Stock');
const Customer = require('../models/Customer');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const moment = require('moment');

// Listar ventas con paginación y filtros
// Función auxiliar para obtener todas las ventas
const getAllSales = async () => {
    return await Sale.findAll();
};

// Función auxiliar para obtener servicios y sus items para múltiples ventas
const getAllSaleServicesWithItems = async (sales) => {
    const allSaleServices = [];
    
    for (const sale of sales) {
        const services = await SaleService.findAll({
            where: { sell_id: sale.id },
            attributes: [
                'id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario',
                [literal('\'service\''), 'type']
            ]
        });

        // Obtener items para cada servicio
        for (const service of services) {
            service.dataValues.items = await getSaleItemsForService(service.dataValues.id);
        }
        
        allSaleServices.push(...services);
    }

    return allSaleServices;
};

// Función auxiliar para obtener todos los items de venta
const getAllSaleItems = async (sales) => {
    const allItems = [];
    
    for (const sale of sales) {
        const items = await SaleItem.findAll({
            where: { sell_id: sale.id },
            attributes: [
                'id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario',
                [literal('\'stock\''), 'type']
            ]
        });
        allItems.push(...items);
    }
    
    return allItems;
};

// Función auxiliar para construir el resultado de múltiples ventas
const buildSalesResult = (sales, services, independentItems) => {
    return sales.map(sale => ({
        ...sale.dataValues,
        items: [
            ...services.filter(service => service.sell_id === sale.id),
            ...independentItems.filter(item => item.sell_id === sale.id)
        ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }));
};

const getSales = async (req, res) => {
    try {
        // Obtener todas las ventas
        const sales = await getAllSales();
        if (!sales || sales.length === 0) {
            return res.status(404).json({ error: 'No se encontraron ventas' });
        }

        // Obtener servicios y sus items asociados
        const saleServices = await getAllSaleServicesWithItems(sales);
        
        // Obtener items no asociados a servicios
        const saleItems = await getAllSaleItems(sales);

        // Filtrar items independientes
        const independentItems = filterIndependentItems(saleItems, saleServices);

        // Construir resultado final
        const result = buildSalesResult(sales, saleServices, independentItems);

        res.json({
            total: result.length,
            datos: result
        });
    } catch (error) {
        console.error('Error al obtener las ventas:', error);
        res.status(500).json({
            error: 'Error al obtener las ventas',
            detalles: error.message
        });
    }
};

// Obtener una venta por ID
// Funciones auxiliares
const getSaleData = async (id) => {
    return await Sale.findByPk(id);
};

const getSaleServicesWithItems = async (saleId) => {
    const services = await SaleService.findAll({
        where: { sell_id: saleId },
        attributes: [
            'id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario',
            [literal('\'service\''), 'type']
        ]
    });

    // Obtener items para cada servicio
    for (const service of services) {
        service.dataValues.items = await getSaleItemsForService(service.dataValues.id);
    }

    return services;
};

const getSaleItemsForService = async (serviceId) => {
    return await SaleItem.findAll({
        where: { service_id: serviceId },
        attributes: [
            'id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario',
            [literal('\'stock\''), 'type']
        ]
    });
};

const filterIndependentItems = (allItems, services) => {
    return allItems.filter(item => {
        const itemData = item.dataValues;
        return !isItemAssociatedWithService(itemData, services);
    }).map(item => item.dataValues);
};

const isItemAssociatedWithService = (item, services) => {
    return services.some(service => 
        service.dataValues.items?.some(serviceItem => 
            serviceItem.service_id === item.service_id
        )
    );
};

const buildSaleResult = (sale, services, independentItems, customer) => {
    const { customer_id, ...saleData } = sale.dataValues;
    return {
        ...saleData,
        customer: customer.dataValues,
        items: [...services, ...independentItems].sort((a, b) => 
            new Date(b.fecha) - new Date(a.fecha)
        )
    };
};

const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener la venta principal
        const sale = await getSaleData(id);
        if (!sale) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        if(!sale.customer_id) {
            return res.status(404).json({ error: 'La venta no tiene un cliente asociado' });
        }

        const customer = await Customer.findByPk(sale.customer_id);
        if (!customer) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Obtener servicios y sus items asociados
        const saleServices = await getSaleServicesWithItems(id);
        
        // Obtener items no asociados a servicios
        const saleItems = await SaleItem.findAll({
            where: { sell_id: id },
            attributes: [
            'id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario',
            [literal('\'stock\''), 'type']
        ]
        });

        // Filtrar items independientes
        const independentItems = filterIndependentItems(saleItems, saleServices);

        // Construir resultado final
        const result = buildSaleResult(sale, saleServices, independentItems, customer);

        res.json(result);
    } catch (error) {
        console.error('Error al obtener la venta:', error);
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
        const { fecha, id_factura, customer_id, productos } = req.body;

        // Verificar que todos los campos requeridos estén presentes
        if (!fecha || !id_factura || !customer_id || !productos || !productos.length) {
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

        // extra los productos que sean de tipo 'stock'.
        const productosDeStock = []
        productos.forEach(item => {
            if (item.type === 'stock') {
                productosDeStock.push(item)
            } else if (item.type === 'service') {
                item.productosAsociado.forEach(producto => {
                    productosDeStock.push(producto)
                })
            }
        });
        // Verificar y validar todos los productos antes de crear la venta
        for (const producto of productosDeStock) {
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
            id_factura,
            customer_id
        }, { transaction: t });

        // Crear los productos vendidos y actualizar stock
        const productosVendidos = [];
        for (const producto of productos) {
            if (producto.type === 'stock') {
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
            } else if (producto.type === 'service') {

                const servicioVendido = await SaleService.create({
                    sell_id: sale.id,
                    cantidad: parseInt(producto.cantidad),
                    fecha: fecha,
                    service_id: producto.id,
                    nombre: producto.nombre,
                    precioTotal: parseFloat(producto.precioTotal).toFixed(2),
                    precioUnitario: parseFloat(producto.precioUnitario).toFixed(2)
                }, { transaction: t });

                productosVendidos.push(servicioVendido);
                if (producto.productosAsociado.length > 0 && producto.productosAsociado) {
                    for (const stockItem of producto.productosAsociado) {
                        const stock = await Stock.findOne({
                            where: { codigo: stockItem.codigo },
                            transaction: t,
                            lock: true // Bloquear el registro para evitar condiciones de carrera
                        });
                        const servicioVendidoId = await servicioVendido.id
                        
                        // Crear el registro de producto vendido
                        const productoVendido = await SaleItem.create({
                            sell_id: sale.id,
                            cantidad: parseInt(stockItem.cantidadInput),
                            fecha: fecha,
                            producto_id: stockItem.codigo,
                            service_id: Number(servicioVendidoId),
                            nombre: stockItem.producto,
                            precioTotal: parseFloat(stockItem.precioTotal).toFixed(2),
                            precioUnitario: parseFloat(stockItem.precioUnitario).toFixed(2)
                        }, { transaction: t });

                        productosVendidos.push(productoVendido);

                        // Actualizar stock
                        await stock.update({
                            cantidad: (parseInt(stock.cantidad) - parseInt(stockItem.cantidadInput)).toString()
                        }, { transaction: t });
                    }
                }
            }
            
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

const getWeekSales = async (req, res) => {
    try {
        const endDate = moment().endOf('day');
        const startDate = moment().subtract(7, 'days').startOf('day');
        
        // Obtener ventas de la última semana
        const sales = await Sale.findAll({
            where: {
                fecha: {
                    [Op.between]: [startDate.toISOString(), endDate.toISOString()]
                }
            },
            include: [
                { model: Customer, as: 'customer' }
            ]
        });

        if (!sales || sales.length === 0) {
            return res.status(404).json({ error: 'No se encontraron ventas en la última semana' });
        }

        // Obtener servicios y sus items asociados
        const saleServices = await getAllSaleServicesWithItems(sales);
        
        // Obtener items no asociados a servicios
        const saleItems = await getAllSaleItems(sales);

        // Filtrar items independientes
        const independentItems = filterIndependentItems(saleItems, saleServices);

        // Construir resultado final
        const result = buildSalesResult(sales, saleServices, independentItems);

        res.json({
            total: result.length,
            datos: result
        });
    } catch (error) {   
        console.error('Error al obtener ventas de la semana:', error);
        res.status(500).json({
            error: 'Error al obtener las ventas de la semana',
            detalles: error.message
        });
    }
};

const getBestSells = async (req, res) => {
    try {
        const bestSells = await SaleItem.findAll({
            attributes: [
                'nombre',
                'producto_id',
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalVendido'],
                [sequelize.fn('COUNT', sequelize.col('sell_id')), 'totalVentas'],
                [sequelize.fn('AVG', sequelize.col('precioUnitario')), 'precioPromedio']
            ],
            group: ['producto_id', 'nombre'],
            order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']],
            having: sequelize.literal('totalVendido > 0')
        });
        console.log('bestSells',bestSells)
        res.json({
            total: bestSells.length,
            datos: bestSells.map(item => ({
                nombre: item.nombre,
                producto_id: item.producto_id,
                totalVendido: parseInt(item.getDataValue('totalVendido')),
                totalVentas: parseInt(item.getDataValue('totalVentas')),
                precioUnitario: parseFloat(item.getDataValue('precioPromedio')).toFixed(2)
            }))
        });
    } catch (error) {
        console.error('Error al obtener las mejores ventas:', error);
        res.status(500).json({
            error: 'Error al obtener las mejores ventas',
            detalles: error.message
        });
    }
};

const getBestServices = async (req, res) => {
    try {
        const bestServices = await SaleService.findAll({
            attributes: [
                'nombre',
                'service_id',
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'totalVendido'],
                [sequelize.fn('COUNT', sequelize.col('sell_id')), 'totalVentas'],
                [sequelize.fn('AVG', sequelize.col('precioUnitario')), 'precioPromedio']
            ],
            group: ['service_id', 'nombre'],
            order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']],
            having: sequelize.literal('totalVendido > 0')
        });
        console.log('bestServices',bestServices)
        res.json({
            total: bestServices.length,
            datos: bestServices.map(item => ({
                nombre: item.nombre,
                service_id: item.service_id,
                totalVendido: parseInt(item.getDataValue('totalVendido')),
                totalVentas: parseInt(item.getDataValue('totalVentas')),
                precioUnitario: parseFloat(item.getDataValue('precioPromedio')).toFixed(2)
            }))
        });
    } catch (error) {
        console.error('Error al obtener los mejores servicios:', error);
        res.status(500).json({
            error: 'Error al obtener los mejores servicios',
            detalles: error.message
        });
    }
}
module.exports = {
    getSales,
    getSaleById,
    createSale,
    updateSaleStatus,
    getWeekSales,
    getBestSells,
    getBestServices
};
