const express = require("express");
const { Report } = require("../models");
const { protect } = require("../middleware/auth");
const router = express.Router();
router.post("/", protect, async (req, res) => {
  const { postId, reason, description } = req.body;
  const reporterId = req.user.id;

  try {
    // Cek apakah laporan sudah ada
    const existingReport = await Report.findOne({
      where: { postId, reporterId },
    });

    if (existingReport) {
      return res.status(409).json({
        message: "Anda sudah melaporkan postingan ini sebelumnya.",
      });
    }

    // Buat laporan baru
    await Report.create({
      postId,
      reporterId,
      reason,
      description,
    });

    return res.status(201).json({ message: "Laporan berhasil dikirim." });
  } catch (err) {
    console.error("Report Error:", err);
    return res.status(500).json({ message: "Gagal mengirim laporan." });
  }
});

module.exports = router;
