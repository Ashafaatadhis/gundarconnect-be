const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token tidak ada" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak: Bukan admin" });
    }

    // Simpan user di request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

module.exports = isAdmin;
