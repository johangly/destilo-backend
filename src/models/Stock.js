const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { Supplier } = require('./Supplier');

const Stock = sequelize.define('Stock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    precioUnitario: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    producto: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'proveedores', // Nombre de la tabla de proveedores
            key: 'id'
        }
    }
}, {
    tableName: 'stocks',
    timestamps: false
});


// Establecer la relación con el modelo Supplier
Stock.belongsTo(Supplier, {
    foreignKey: 'proveedor_id',
    as: 'proveedor'
});

Supplier.hasMany(Stock, {
    foreignKey: 'proveedor_id',
    as: 'stocks'
});


module.exports = Stock;
