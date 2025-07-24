const { Post, Comment } = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like'); // baru kita tambahkan

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatar', 'bio', 'major', 'studentId']
        },
        {
          model: Comment,
          as: 'comments',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar']
          }]
        },
        {
          model: User,
          as: 'likes',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'avatar', 'bio', 'major', 'studentId']
        },
        {
          model: Comment,
          as: 'comments',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'fullName', 'avatar', 'username']
          }]
        },
        {
          model: User,
          as: 'likes',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post tidak ditemukan' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllPosts, getPostById };