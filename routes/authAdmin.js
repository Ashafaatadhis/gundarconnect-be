const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// routes/adminAuth.js
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Username atau password salah" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Akses hanya untuk admin" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "30d",
    }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    },
  });
});

module.exports = router;
