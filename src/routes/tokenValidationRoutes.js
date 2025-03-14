const express = require('express');
const router = express.Router();
const ActivationToken = require('../models/ActivationToken');
const User = require('../models/User');
const sequelize = require('../config/sequelize');

router.get('/:token', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { token } = req.params;
        if (!token) {   
            return res.status(400).json({ error: 'Token is required' });
        }

        const tokenRecord = await ActivationToken.findOne({ 
            where: { token },
            transaction
        });
        
        if (!tokenRecord) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Token not found' });
        }

        const now = new Date();
        if (now > tokenRecord.expiration) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Token has expired' });
        }

        const user = await User.findByPk(tokenRecord.user_id, { transaction });

        if(!user) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status === 'validated') {
            await transaction.rollback();
            return res.status(400).json({ error: 'User is already validated' });
        }

        user.status = 'validated';
        await user.save({ transaction });

        await tokenRecord.destroy({ transaction });

        await transaction.commit();

        return res.status(200).json({ 
            status: 'validated',
            userId: user.id
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error validating token:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
