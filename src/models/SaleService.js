const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SaleService = sequelize.define('SaleService', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sell_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sells', // Referencia a la tabla de ventas
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
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'services', // Referencia a la tabla de servicios
            key: 'id'
        }
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
    tableName: 'servicios_vendidos', // Nombre de la tabla en la base de datos
    timestamps: false // Deshabilitar los campos createdAt y updatedAt
});

module.exports = SaleService;