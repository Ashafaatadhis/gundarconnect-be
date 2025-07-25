const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Op } = require("sequelize");
// const fetch = require('node-fetch');
const bcrypt = require("bcryptjs");
const { default: axios } = require("axios");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, password, fullName, studentId } = req.body;
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ username }, { studentId }],
      },
    });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      username,
      password,
      fullName,
      // major,
      studentId,
    });
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        // major: user.major,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Cek ke API akun validator
    const response = await axios.post(
      "https://validator.gmni.my.id/api/login",
      {
        username,
        password,
      }
    );

    console.log("API Response:", response.data);

    // 2. Jika valid, cek apakah user sudah ada di DB lokal
    let user = await User.findOne({ where: { username } });

    if (!user) {
      // Buat user baru di DB lokal
      const hashedPassword = await bcrypt.hash("RANDOM-PASSWORD", 12);

      // Anggap API akunvalidator mengembalikan data seperti `fullName`, `major`, `studentId`
      const { username, npm } = response.data;

      user = await User.create({
        username,
        password: hashedPassword,
        fullName: username,
        // major: "-",
        studentId: npm,
      });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        // major: user.major,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res
      .status(401)
      .json({ message: "Login failed: Invalid credentials or server error" });
  }
});

module.exports = router;
