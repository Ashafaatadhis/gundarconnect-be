const { Op, fn, col, where } = require('sequelize');
const express = require('express');
const router = express.Router();
const { Post, User } = require('../models');

router.get('/', async (req, res) => {
  const keyword = req.query.q;

  if (!keyword) {
    return res.status(400).json({ message: 'Query parameter q is required' });
  }

  try {
    const results = await Post.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['fullName']
      }],
      where: {
        [Op.or]: [
          { content: { [Op.iLike]: `%${keyword}%` } },
          // { title: { [Op.iLike]: `%${keyword}%` } },
          // cari keyword juga di fullName user (relasi)
          where(fn('LOWER', col('author.fullName')), {
            [Op.iLike]: `%${keyword.toLowerCase()}%`
          })
        ]
      }
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;