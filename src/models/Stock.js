const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

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
    proveedor: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'stocks',
    timestamps: false
});

module.exports = Stock;
