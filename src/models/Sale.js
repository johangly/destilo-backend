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

// Definir la relación con SaleItem
Sale.hasMany(SaleItem, {
    foreignKey: 'sell_id',
    as: 'items'
});

module.exports = Sale;
