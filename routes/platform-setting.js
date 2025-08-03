const express = require("express");
const PlatformSetting = require("../models/PlatformSetting");
const router = express.Router();

// GET
router.get("/", async (req, res) => {
  try {
    const setting = await PlatformSetting.findOne(); // Karena hanya 1 baris
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
