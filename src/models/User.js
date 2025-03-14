const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Ajusta la ruta según tu estructura

const User = sequelize.define('Users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'employee'),
    defaultValue: 'employee',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('pending', 'validated'),
    allowNull: false,
    defaultValue: 'pending', // Por defecto, el estado es 'pending'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // El email debe ser único
    validate: {
        isEmail: true, // Validar que el campo sea un email válido
    },
  },
},{
  tableName: 'users',
  timestamps: false
});


// Relaciones del modelo User
User.associate = (models) => {
  // Relación con PasswordResetToken
  User.hasMany(models.PasswordResetToken, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });

  // Relación con ActivationToken
  User.hasMany(models.ActivationToken, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
};

module.exports = User;