// routes/followRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const protect = require('../middleware/auth').protect;

// FOLLOW user
router.post('/follow', protect, async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  console.log('Follower ID:', followerId);
  console.log('Following ID:', followingId);

  if (followerId === followingId) {
    return res.status(400).json({ message: "Kamu tidak bisa follow diri sendiri." });
  }

  try {
    await db.query(
      `INSERT INTO "UserFollowers" ("followerId", "followingId") VALUES (:followerId, :followingId)
       ON CONFLICT DO NOTHING`,
      {
        replacements: { followerId, followingId },
        type: db.QueryTypes.INSERT
      }
    );

    res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    console.error('Error while following user:', err);
    res.status(500).json({ message: 'Error while following user' });
  }
});

// UNFOLLOW user
router.post('/unfollow', protect, async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  try {
    await db.query(
  `DELETE FROM "UserFollowers" WHERE "followerId" = :followerId AND "followingId" = :followingId`,
  {
    replacements: { followerId, followingId },
    type: db.QueryTypes.DELETE
  }
);
    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error while unfollowing user' });
  }
});

// Cek apakah user sudah follow user lain
router.get('/status/:userId', protect, async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.userId;

  try {
    const result = await db.query(
      `SELECT * FROM "UserFollowers" 
       WHERE "followerId" = :followerId AND "followingId" = :followingId`,
      {
        replacements: { followerId, followingId },
        type: db.QueryTypes.SELECT
      }
    );

    res.json({ isFollowing: result.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking follow status' });
  }
});

// Dapatkan jumlah followers dan following
router.get('/stats/:userId', protect, async (req, res) => {
  const userId = req.params.userId;

  try {
    const followersResult = await db.query(
  `SELECT COUNT(*) AS count FROM "UserFollowers" WHERE "followingId" = :userId`,
  {
    replacements: { userId },
    type: db.QueryTypes.SELECT
  }
);

const followingResult = await db.query(
  `SELECT COUNT(*) AS count FROM "UserFollowers" WHERE "followerId" = :userId`,
  {
    replacements: { userId },
    type: db.QueryTypes.SELECT
  }
);

res.json({
  followers: parseInt(followersResult[0].count),
  following: parseInt(followingResult[0].count)
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching follow stats' });
  }
});

module.exports = router;