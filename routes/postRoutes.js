// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById } = require('../controllers/postController');

// GET all posts - ubah dari '/posts' ke '/'
router.get('/', getAllPosts);

// GET single post by ID - ubah dari '/posts/:id' ke '/:id'
router.get('/:id', getPostById);

module.exports = router;