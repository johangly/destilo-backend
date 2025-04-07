const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sequelize = require('../config/sequelize');
const { User, SecurityQuestion, SecurityAnswer, PasswordResetToken } = require('../models');


router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate userId
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get security questions for the user
        const securityQuestions = await SecurityQuestion.findAll({
            where: { user_id: userId },
            order: [['question_order', 'ASC']],
            attributes: ['id', 'question_text', 'question_order', 'is_custom', 'createdAt']
        });

        return res.status(200).json({ 
            userId: user.id,
            questions: securityQuestions
        });
    } catch (error) {
        console.error('Error fetching security questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { userId, questions } = req.body;

        // Validate request body
        if (!userId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid request format. Expected userId and questions array' });
        }

        // Validate questions array length
        if (questions.length < 1 || questions.length > 5) {
            return res.status(400).json({ error: 'Number of questions must be between 1 and 5' });
        }

        // Find user
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate each question and answer
        for (const [index, item] of questions.entries()) {
            if (!item.question || !item.answer || typeof item.isCustom !== 'boolean') {
                await transaction.rollback();
                return res.status(400).json({ 
                    error: 'Invalid question format',
                    details: `Question at position ${index + 1} is missing required fields`
                });
            }
        }

        // Find existing security questions for the user
        const existingQuestions = await SecurityQuestion.findAll({
            where: { user_id: userId },
            include: ['SecurityAnswer'],
            transaction
        });

        // Delete existing questions and answers if they exist
        if (existingQuestions.length > 0) {
            for (const question of existingQuestions) {
                await SecurityAnswer.destroy({
                    where: { question_id: question.id },
                    transaction
                });
            }
            await SecurityQuestion.destroy({
                where: { user_id: userId },
                transaction
            });
        }

        const createdQuestions = [];

        // Create new questions and answers
        for (let i = 0; i < questions.length; i++) {
            const { question, answer, isCustom } = questions[i];
            
            // Create security question
            const securityQuestion = await SecurityQuestion.create({
                user_id: userId,
                question_text: question,
                question_order: i + 1,
                is_custom: isCustom
            }, { transaction });

            // Hash the answer
            const answerHash = await bcrypt.hash(answer, 10);

            // Create security answer
            await SecurityAnswer.create({
                question_id: securityQuestion.id,
                answer_hash: answerHash
            }, { transaction });

            createdQuestions.push({
                id: securityQuestion.id,
                question: securityQuestion.question_text,
                order: securityQuestion.question_order,
                isCustom: securityQuestion.is_custom
            });
        }

        await transaction.commit();

        const action = existingQuestions.length > 0 ? 'updated' : 'created';
        return res.status(201).json({ 
            message: `Security questions ${action} successfully`,
            questions: createdQuestions
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating security questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/getSecurityQuestionsByEmail/:email', async (req, res) => {
    try {
        const email = req.params.email;

        // Validate email
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get security questions for the user
        const securityQuestions = await SecurityQuestion.findAll({
            where: { user_id: user.id },
            order: [['question_order', 'ASC']],
            attributes: ['id', 'question_text', 'question_order', 'is_custom', 'createdAt']
        });

        return res.status(200).json({ 
            userId: user.id,
            email: user.email,
            questions: securityQuestions ? securityQuestions : []
        });
    } catch (error) {
        console.error('Error fetching security questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/validate', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { userId, questions } = req.body;
        // Validate request body
        if (!userId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Invalid request format. Expected userId and questions array' });
        }

        // Find user
        const user = await User.findByPk(userId, { transaction });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate each question has required fields
        for (const [index, item] of questions.entries()) {
            if (!item.id || !item.answer || !item.order) {
                await transaction.rollback();
                return res.status(400).json({ 
                    error: 'Invalid question format',
                    details: `Question at position ${index + 1} is missing required fields (id, answer, order)`
                });
            }
        }

        // Get user's security questions with their answers
        const userQuestions = await SecurityQuestion.findAll({
            where: { user_id: userId },
            include: [{
                model: SecurityAnswer,
                as: 'SecurityAnswer',
                attributes: ['answer_hash']
            }],
            order: [['question_order', 'ASC']],
            transaction
        });

        if (userQuestions.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'No security questions found for this user' });
        }

        // Verify each answer
        const results = await Promise.all(questions.map(async (questionToValidate) => {
            const storedQuestion = userQuestions.find(q => q.id === questionToValidate.id);
            
            if (!storedQuestion) {
                return { valid: false, order: questionToValidate.order, error: 'Question not found' };
            }

            if (storedQuestion.question_order !== questionToValidate.order) {
                return { valid: false, order: questionToValidate.order, error: 'Question order mismatch' };
            }

            const isValid = await bcrypt.compare(questionToValidate.answer, storedQuestion.SecurityAnswer.answer_hash);
            return { valid: isValid, order: questionToValidate.order };
        }));

        // Check if all answers are correct
        const invalidAnswers = results.filter(result => !result.valid);

        if (invalidAnswers.length > 0) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Invalid answers',
                details: invalidAnswers.map(result => ({
                    order: result.order,
                    message: result.error || 'Incorrect answer'
                }))
            });
        }

        // Si todas las respuestas son correctas, generar token de restablecimiento
        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1); // Token válido por 1 hora

        // Eliminar tokens anteriores del usuario
        await PasswordResetToken.destroy({
            where: { user_id: userId },
            transaction
        });

        // Crear nuevo token
        const resetToken = await PasswordResetToken.create({
            token,
            expiration,
            user_id: userId
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({ 
            message: 'Security questions validated successfully',
            validated: true,
            token: token,
            expiration: expiration
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error validating security questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
