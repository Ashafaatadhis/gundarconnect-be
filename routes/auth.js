const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Op } = require('sequelize');
// const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, major, studentId } = req.body;
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { studentId }
        ]
      }
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      username,
      password,
      fullName,
      major,
      studentId
    });
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        major: user.major,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        major: user.major,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
