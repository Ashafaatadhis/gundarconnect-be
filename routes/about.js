const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const About = require('../models/About');

// Get About info for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const about = await About.findOne({ where: { userId: req.params.userId } });
    if (!about) return res.status(404).json({ message: 'About info not found' });
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update About info for a user
router.post('/:userId', protect, async (req, res) => {
  try {
    const { bio1, bio2, skillsTechnical, skillsSoft, skillsLanguages, experience } = req.body;
    let about = await About.findOne({ where: { userId: req.params.userId } });
    if (about) {
      // Update
      about.bio1 = bio1;
      about.bio2 = bio2;
      about.skillsTechnical = skillsTechnical;
      about.skillsSoft = skillsSoft;
      about.skillsLanguages = skillsLanguages;
      about.experience = experience;
      await about.save();
    } else {
      // Create
      about = await About.create({
        userId: req.params.userId,
        bio1,
        bio2,
        skillsTechnical,
        skillsSoft,
        skillsLanguages,
        experience
      });
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
