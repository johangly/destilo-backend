// models/ActivationToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Ajusta la ruta según tu estructura

const ActivationToken = sequelize.define('ActivationToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiration: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'activation_tokens', // Nombre de la tabla en la base de datos
  timestamps: false, // No usar campos createdAt y updatedAt
});

// Relación con el modelo User
ActivationToken.associate = (models) => {
  ActivationToken.belongsTo(models.User, {
    foreignKey: 'user_id', // Clave foránea que referencia a la tabla users
    onDelete: 'CASCADE', // Si se elimina un usuario, se eliminan sus tokens
  });
};

module.exports = ActivationToken;