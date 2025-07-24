const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Post } = require('../models/Post');
const User = require('../models/User');
const SavedPost = require('../models/SavedPost');

// Associations (pastikan hanya dijalankan sekali di project, biasanya di models/SavedPost.js)
// User.belongsToMany(Post, { through: SavedPost, as: 'savedPosts', foreignKey: 'userId' });
// Post.belongsToMany(User, { through: SavedPost, as: 'savedBy', foreignKey: 'postId' });

// Save a post
router.post('/:postId/save', protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    // Pastikan postId valid
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Cek apakah sudah tersimpan
    const [saved, created] = await SavedPost.findOrCreate({
      where: { userId, postId }
    });
    res.json({ success: true, saved: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unsave a post
router.delete('/:postId/save', protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    // Pastikan postId valid
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await SavedPost.destroy({ where: { userId, postId } });
    res.json({ success: true, saved: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all saved posts for user
router.get('/my', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    // Ambil relasi SavedPost agar dapat createdAt (waktu disimpan)
    const savedPosts = await SavedPost.findAll({
      where: { userId },
      include: [{
        model: Post,
        as: 'post',
        include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'avatar'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    // Mapping agar frontend dapat field savedAt dan struktur post
    const result = savedPosts.map(item => {
      const post = item.post?.toJSON ? item.post.toJSON() : item.post
      return {
        ...post,
        savedAt: item.createdAt
      }
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;