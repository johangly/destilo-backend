// models/PasswordResetToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Ajusta la ruta según tu estructura

const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
  tableName: 'password_reset_tokens',
  timestamps: false,
});

// Relación con el modelo User
PasswordResetToken.associate = (models) => {
  PasswordResetToken.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
};

module.exports = PasswordResetToken;