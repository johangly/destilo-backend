const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SecurityQuestion = sequelize.define('SecurityQuestions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  question_text: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  question_order: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1, 2, 3 para el orden de preguntas',
    validate: {
      min: 1,
      max: 3
    }
  },
  is_custom: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '0=predeterminada, 1=personalizada'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'security_questions',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'question_order'],
      name: 'user_order'
    }
  ]
});


module.exports = SecurityQuestion;
