const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SecurityAnswer = sequelize.define('SecurityAnswers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  answer_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash de la respuesta (bcrypt)'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'security_answers',
  timestamps: false,
  indexes: [
    {
      fields: ['question_id'],
      name: 'question_id'
    }
  ]
});


module.exports = SecurityAnswer;
