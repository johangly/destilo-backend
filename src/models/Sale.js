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
    }
}, {
    tableName: 'sells',
    timestamps: false
});

// Importamos SaleItem después de definir Sale para evitar dependencias circulares
const SaleItem = require('./SaleItem');
const SaleService = require('./SaleService');

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


module.exports = Sale;
