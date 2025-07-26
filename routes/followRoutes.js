// routes/followRoutes.js

const express = require("express");
const router = express.Router();
const { Userfollowers } = require("../models");
const protect = require("../middleware/auth").protect;

// FOLLOW user
router.post("/follow", protect, async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  if (followerId === followingId) {
    return res
      .status(400)
      .json({ message: "Kamu tidak bisa follow diri sendiri." });
  }

  try {
    await Userfollowers.findOrCreate({
      where: { followerId, followingId },
    });

    res.status(200).json({ message: "Followed successfully" });
  } catch (err) {
    console.error("Error while following user:", err);
    res.status(500).json({ message: "Error while following user" });
  }
});

// UNFOLLOW user
router.post("/unfollow", protect, async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  try {
    await Userfollowers.destroy({
      where: { followerId, followingId },
    });
    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while unfollowing user" });
  }
});

// Cek apakah user sudah follow user lain
router.get("/status/:userId", protect, async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.userId;

  try {
    const result = await Userfollowers.findOne({
      where: { followerId, followingId },
    });

    res.json({ isFollowing: !!result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking follow status" });
  }
});

// Dapatkan jumlah followers dan following
router.get("/stats/:userId", protect, async (req, res) => {
  const userId = req.params.userId;

  try {
    const followers = await Userfollowers.count({
      where: { followingId: userId },
    });

    const following = await Userfollowers.count({
      where: { followerId: userId },
    });

    res.json({
      followers,
      following,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching follow stats" });
  }
});

module.exports = router;
