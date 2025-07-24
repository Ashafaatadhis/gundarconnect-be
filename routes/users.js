const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { io } = require('../app');
const Notification = require('../models/Notification');

// Get all users
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['fullName', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.findAll({
      where: {
        [User.sequelize.Op.or]: [
          { username: { [User.sequelize.Op.iLike]: `%${query}%` } },
          { fullName: { [User.sequelize.Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: { exclude: ['password'] },
      limit: 10
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow user
router.post('/:userId/follow', protect, async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findByPk(req.user.id);
    await user.addFollowing(targetUser);
    // Trigger notification
    if (targetUser.id !== user.id) {
      const notif = await Notification.create({
        type: 'follow',
        message: `${user.fullName || user.username} mulai mengikuti Anda`,
        userId: targetUser.id,
        actorId: user.id
      });
      io.to(`user_${targetUser.id}`).emit('notification', notif);
    }
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});


module.exports = router;
