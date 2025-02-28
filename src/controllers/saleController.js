const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const SaleService = require('../models/SaleService');
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
                attributes: ['cantidad', 'fecha', 'producto_id', 'nombre', 'precioTotal', 'precioUnitario'],
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
        // console.log('id de la venta desde backend:',id)
        const sale = await Sale.findByPk(id);
        const saleServices = await SaleService.findAll({
            where: {
                sell_id: id
            },
            attributes: ['id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario']
        });
        // console.log('saleServices',saleServices[0])
        // console.log('saleServices.length',saleServices.length)
        // busco todos los stocks de los servicios en la venta
        for (let i = 0; i < saleServices.length; i++) {
            const service = saleServices[i].dataValues;
            const saleItemsFromService = await SaleItem.findAll({
                where: {
                    service_id: service.id
                },
                attributes: ['id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario']
            });
            service.items = saleItemsFromService;
        }
        saleServices.forEach(element => {
            console.log('saleServices',element.dataValues)
            console.log('-----------------------------------------------------------')
        });
        
        const saleItems = await SaleItem.findAll({
            where: {
                sell_id: id
            },
            attributes: ['id', 'sell_id', 'cantidad', 'fecha', 'service_id', 'nombre', 'precioTotal', 'precioUnitario']
        });

        const newSaleItems = [];
        for (let index = 0; index < saleItems.length; index++) {
            const itemSaleIteration = saleItems[index].dataValues;

            let valueExist = false;
            for (let i = 0; i < saleServices.length; i++) {
                const service = saleServices[i].dataValues;
                if (service.items && service.items.length > 0) {
                    for (let i2 = 0; i2 < service.items.length; i2++) {
                        const stockInService = service.items[i2];
                        
                        if(stockInService.service_id === itemSaleIteration.service_id) {
                            valueExist = true;
                            break;
                        }
                    }
                }
            }

            if(!valueExist) {
                newSaleItems.push(itemSaleIteration);
            }
        }
        console.log('-----------------------------------------------------------')

        console.log('newSaleItems',newSaleItems)
        const result = {
            ...sale.dataValues,
            items: [
                ...saleServices,
                ...newSaleItems
            ].sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
        }
        console.log('-----------------------------------------------------------')
        console.log('resultado alterado',result)
        // include: [
        //     {
        //         model: Customer,
        //         as: 'cliente',
        //         attributes: ['id', 'nombre', 'email', 'telefono']
        //     },
        //     {
        //         model: SaleItem,
        //         as: 'items',
        //         include: [{
        //             model: Service,
        //             as: 'servicio',
        //             attributes: ['id', 'nombre', 'precio']
        //         }]
        //     }
        // ]
        console.log('sale consultada:',sale)
        
        if (!sale) {
            return res.status(404).json({
                error: 'Venta no encontrada'
            });
        }

        res.json(result);
    } catch (error) {
        console.log('!!!!!!error al ejecutar el codigo!!!!!!!!:',error)
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
        console.log('productos:', productos)

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
        console.log('productosDeStock',productosDeStock)
        for (const producto of productosDeStock) {
            console.log('producto desde el primer for',producto)
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

        // return;
        // Crear los productos vendidos y actualizar stock
        const productosVendidos = [];
        for (const producto of productos) {
            console.log('producto desde el segundo for:',producto)
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
                    console.log('producto.productosAsociado',producto.productosAsociado)
                    for (const stockItem of producto.productosAsociado) {
                        console.log('stockItem', stockItem)
                        const stock = await Stock.findOne({
                            where: { codigo: stockItem.codigo },
                            transaction: t,
                            lock: true // Bloquear el registro para evitar condiciones de carrera
                        });
                        console.log('stockItem 1')
                        const servicioVendidoId = await servicioVendido.id
                        console.log('simulacion de insercion',{
                            sell_id: sale.id,
                            cantidad: parseInt(stockItem.cantidadInput),
                            fecha: fecha,
                            producto_id: stockItem.codigo,
                            service_id: Number(servicioVendidoId),
                            nombre: stockItem.producto,
                            precioTotal: parseFloat(stockItem.precioTotal).toFixed(2),
                            precioUnitario: parseFloat(stockItem.precioUnitario).toFixed(2)
                        })
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

                        console.log('stockItem 2')
                        productosVendidos.push(productoVendido);
                        console.log('stockItem 3')

                        // Actualizar stock
                        await stock.update({
                            cantidad: (parseInt(stock.cantidad) - parseInt(stockItem.cantidadInput)).toString()
                        }, { transaction: t });
                        console.log('stockItem 4')

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

module.exports = {
    getSales,
    getSaleById,
    createSale,
    updateSaleStatus
};
