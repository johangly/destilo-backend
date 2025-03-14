const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');


const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    id_factura: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    customer_id: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Customer',
            key: 'id'
        }
    }
}, {
    tableName: 'sells',
    timestamps: false
});

// Importamos SaleItem después de definir Sale para evitar dependencias circulares
const SaleItem = require('./SaleItem');
const SaleService = require('./SaleService');
const Customer = require('./Customer');

// Definir la relación con SaleItem
Sale.hasMany(SaleItem, {
    foreignKey: 'sell_id',
    as: 'items'
});

// Relación con SaleService
Sale.hasMany(SaleService, {
    foreignKey: 'sell_id',
    as: 'services'
});

// Definir la relación con Customer 
Sale.belongsTo(Customer, {
    foreignKey: 'customer_id', // Clave foránea en el modelo Sale
    as: 'customer'            // Alias para la relación
});


module.exports = Sale;
