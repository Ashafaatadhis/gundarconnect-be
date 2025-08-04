const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { Post, Comment } = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getPostById } = require("../controllers/postController");
const upload = require("../middleware/upload");
const PlatformSetting = require("../models/PlatformSetting");
const moderateGroq = require("../middleware/groq-moderate");

// GET: Single Post
router.get("/:id", getPostById);

// GET: All Posts (feed)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "username", "fullName", "avatar"],
            },
          ],
        },
        {
          model: User,
          as: "likes",
          attributes: ["id", "username"],
        },
      ],
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create new post
router.post(
  "/",
  protect,
  upload.single("image"),
  moderateGroq,

  async (req, res) => {
    try {
      const { content } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      // Jika lolos, baru buat post
      const post = await Post.create({
        authorId: req.user.id,
        content,
        image,
      });

      const populatedPost = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "fullName", "avatar"],
          },
        ],
      });

      res.status(201).json(populatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST: Like/Unlike a post
router.post("/:postId/like", protect, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findByPk(req.user.id);
    const liked = await post.hasLike(user);

    if (!liked) {
      await post.addLike(user);

      // Create notification
      if (post.authorId !== user.id) {
        const notif = await Notification.create({
          type: "like",
          message: `${user.fullName || user.username} menyukai postingan Anda`,
          userId: post.authorId,
          actorId: user.id,
          postId: post.id,
        });

        // Tambahkan data actor ke notif sebelum dikirim lewat socket
        notif.dataValues.actor = {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
        };

        req.app
          .get("io")
          .to(`user_${post.authorId}`)
          .emit("notification", notif);
      }
    } else {
      await post.removeLike(user);
    }

    const updatedPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: "likes", attributes: ["id", "username"] }],
    });

    res.json(updatedPost);
  } catch (error) {
    console.error("LIKE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST: Add comment
router.post("/:postId/comments", protect, async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      postId: post.id,
      authorId: req.user.id,
      content,
      image,
    });

    // Create notification
    if (post.authorId !== req.user.id) {
      const notif = await Notification.create({
        type: "comment",
        message: `${
          req.user.fullName || req.user.username
        } mengomentari postingan Anda`,
        userId: post.authorId,
        actorId: req.user.id,
        postId: post.id,
        commentId: comment.id,
      });

      // Tambahkan data actor manual
      notif.dataValues.actor = {
        id: req.user.id,
        username: req.user.username,
        fullName: req.user.fullName,
        avatar: req.user.avatar,
      };

      req.app.get("io").to(`user_${post.authorId}`).emit("notification", notif);
    }

    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "fullName", "avatar"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "username", "fullName", "avatar"],
            },
          ],
        },
      ],
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Post
router.delete("/:postId", protect, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId !== req.user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });

    await post.destroy();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
