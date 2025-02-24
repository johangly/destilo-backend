const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SaleItem = sequelize.define('SaleItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sell_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sells',
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    producto_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    precioTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'productos_vendidos',
    timestamps: false
});

module.exports = SaleItem;
