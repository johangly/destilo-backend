const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

// Importar modelos
const User = require('./User');
const SecurityQuestion = require('./SecurityQuestion');
const SecurityAnswer = require('./SecurityAnswer');
const PasswordResetToken = require('./PasswordResetToken');

// Definir las asociaciones
SecurityQuestion.hasOne(SecurityAnswer, {
    foreignKey: 'question_id',
    as: 'SecurityAnswer'
});

SecurityAnswer.belongsTo(SecurityQuestion, {
    foreignKey: 'question_id',
    as: 'SecurityQuestion'
});

SecurityQuestion.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

module.exports = {
    User,
    SecurityQuestion,
    SecurityAnswer,
    PasswordResetToken
};
