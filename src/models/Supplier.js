const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cargo: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    fechaRegistro: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    productos: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    razonSocial: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rif: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    servicios: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    webrrss: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'proveedores',
    timestamps: false
});

// Modelo para las direcciones de proveedores
const SupplierAddress = sequelize.define('SupplierAddress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    proveedor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'proveedores',
            key: 'id'
        }
    },
    calle: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ciudad: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    pais: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    tableName: 'direcciones_proveedores',
    timestamps: false
});

// Establecer la relación
Supplier.hasMany(SupplierAddress, {
    foreignKey: 'proveedor_id',
    as: 'direcciones'
});

SupplierAddress.belongsTo(Supplier, {
    foreignKey: 'proveedor_id',
    as: 'proveedor'
});

module.exports = {
    Supplier,
    SupplierAddress
};