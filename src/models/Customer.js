const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    ciudad: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    cliente: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    direccion: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    empresa: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    fechaRegistro: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    nrocasa: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    pais: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    provincia: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rif: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'clientes',
    timestamps: false
});

module.exports = Customer;
