const express = require("express");
const router = express.Router();
const { User, Post, Comment, Report } = require("../models");

const { Op, fn, col, literal, Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const PlatformSetting = require("../models/PlatformSetting");
const Notification = require("../models/Notification");

// GET /admin/analytics
router.get("/analytics", async (req, res) => {
  try {
    // Get query parameters for period and metric
    const { period = "7d", metric = "posts" } = req.query;

    // Data utama
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();

    // Ambil data sebelumnya untuk growth (1 bulan lalu, 1 minggu lalu, dll)
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);

    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const usersLastMonth = await User.count({
      where: { createdAt: { [Op.lt]: now, [Op.gte]: lastMonth } },
    });

    const postsLastWeek = await Post.count({
      where: { createdAt: { [Op.lt]: now, [Op.gte]: lastWeek } },
    });

    const commentsYesterday = await Comment.count({
      where: { createdAt: { [Op.lt]: now, [Op.gte]: yesterday } },
    });

    // Growth calculation
    const studentsGrowth =
      usersLastMonth > 0
        ? (((totalUsers - usersLastMonth) / usersLastMonth) * 100).toFixed(1)
        : 0;
    const postsGrowth =
      postsLastWeek > 0
        ? (((totalPosts - postsLastWeek) / postsLastWeek) * 100).toFixed(1)
        : 0;
    const interactionsGrowth =
      commentsYesterday > 0
        ? (
            ((totalComments - commentsYesterday) / commentsYesterday) *
            100
          ).toFixed(1)
        : 0;

    const avgEngagementRate =
      totalPosts > 0 ? ((totalComments / totalPosts) * 100).toFixed(1) : 0;
    const engagementGrowth = (avgEngagementRate - 70).toFixed(1);

    // Trending posts: likes + jumlah komentar terbanyak
    const trendingPosts = await Post.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
          SELECT COUNT(*) FROM "PostLikes" WHERE "PostLikes"."postId" = "Post"."id"
        )`),
            "likesCount",
          ],
          [
            sequelize.literal(`(
          SELECT COUNT(*) FROM "Comments" WHERE "Comments"."postId" = "Post"."id"
        )`),
            "commentsCount",
          ],
        ],
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["fullName", "avatar"],
        },
      ],
      order: [
        [
          sequelize.literal(`(
      (SELECT COUNT(*) FROM "PostLikes" WHERE "PostLikes"."postId" = "Post"."id") +
      (SELECT COUNT(*) FROM "Comments" WHERE "Comments"."postId" = "Post"."id")
    )`),
          "DESC",
        ],
      ],
      limit: 5,
    });

    const trendingContent = trendingPosts.map((post, index) => ({
      id: post.id,
      rank: index + 1,
      title: post.content.substring(0, 60) + "...",
      likes: parseInt(post.getDataValue("likesCount")) || 0,
      comments: parseInt(post.getDataValue("commentsCount")) || 0,
    }));

    // ENHANCED: Dynamic chart data based on period and metric
    const getDateRange = (period) => {
      const end = new Date();
      const start = new Date();

      switch (period) {
        case "7d":
          start.setDate(end.getDate() - 7);
          return { start, end, format: "day", unit: "day" };
        case "30d":
          start.setDate(end.getDate() - 30);
          return { start, end, format: "day", unit: "day" };
        case "90d":
          start.setDate(end.getDate() - 90);
          return { start, end, format: "week", unit: "week" };
        case "1y":
          start.setFullYear(end.getFullYear() - 1);
          return { start, end, format: "month", unit: "month" };
        default:
          start.setDate(end.getDate() - 7);
          return { start, end, format: "day", unit: "day" };
      }
    };

    const { start, end, format, unit } = getDateRange(period);

    let chartData = [];

    // Helper function to get chart data based on model and format
    const getChartDataForModel = async (Model, format) => {
      if (format === "day") {
        return await Model.findAll({
          attributes: [
            [Sequelize.fn("DATE", Sequelize.col("createdAt")), "date"],
            [Sequelize.fn("COUNT", "*"), "count"],
          ],
          where: {
            createdAt: { [Op.between]: [start, end] },
          },
          group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
          order: [[Sequelize.fn("DATE", Sequelize.col("createdAt")), "ASC"]],
        });
      } else if (format === "week") {
        return await Model.findAll({
          attributes: [
            [
              Sequelize.fn("DATE_TRUNC", "week", Sequelize.col("createdAt")),
              "date",
            ],
            [Sequelize.fn("COUNT", "*"), "count"],
          ],
          where: {
            createdAt: { [Op.between]: [start, end] },
          },
          group: [
            Sequelize.fn("DATE_TRUNC", "week", Sequelize.col("createdAt")),
          ],
          order: [
            [
              Sequelize.fn("DATE_TRUNC", "week", Sequelize.col("createdAt")),
              "ASC",
            ],
          ],
        });
      } else if (format === "month") {
        return await Model.findAll({
          attributes: [
            [
              Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")),
              "date",
            ],
            [Sequelize.fn("COUNT", "*"), "count"],
          ],
          where: {
            createdAt: { [Op.between]: [start, end] },
          },
          group: [
            Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")),
          ],
          order: [
            [
              Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")),
              "ASC",
            ],
          ],
        });
      }
    };

    // Get chart data based on selected metric
    switch (metric) {
      case "posts":
        chartData = await getChartDataForModel(Post, format);
        break;
      case "comments":
        chartData = await getChartDataForModel(Comment, format);
        break;
      case "users":
        chartData = await getChartDataForModel(User, format);
        break;
      case "likes":
        // Assuming you have a PostLikes model
        if (format === "day") {
          chartData = await sequelize.query(
            `
            SELECT DATE("createdAt") as date, COUNT(*) as count
            FROM "PostLikes" 
            WHERE "createdAt" BETWEEN :start AND :end
            GROUP BY DATE("createdAt")
            ORDER BY DATE("createdAt") ASC
          `,
            {
              replacements: { start, end },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
        } else if (format === "week") {
          chartData = await sequelize.query(
            `
            SELECT DATE_TRUNC('week', "createdAt") as date, COUNT(*) as count
            FROM "PostLikes" 
            WHERE "createdAt" BETWEEN :start AND :end
            GROUP BY DATE_TRUNC('week', "createdAt")
            ORDER BY DATE_TRUNC('week', "createdAt") ASC
          `,
            {
              replacements: { start, end },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
        } else if (format === "month") {
          chartData = await sequelize.query(
            `
            SELECT DATE_TRUNC('month', "createdAt") as date, COUNT(*) as count
            FROM "PostLikes" 
            WHERE "createdAt" BETWEEN :start AND :end
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY DATE_TRUNC('month', "createdAt") ASC
          `,
            {
              replacements: { start, end },
              type: Sequelize.QueryTypes.SELECT,
            }
          );
        }
        break;
      default:
        chartData = await getChartDataForModel(Post, format);
    }

    // Format chart data for frontend
    const formattedChartData = chartData.map((item) => {
      // Handle both Sequelize result and raw query result
      const date = new Date(item.date || item.getDataValue?.("date"));
      const count = item.count || item.getDataValue?.("count");

      let label;

      if (format === "day") {
        label = date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
        });
      } else if (format === "week") {
        label = `Week ${Math.ceil(date.getDate() / 7)}`;
      } else if (format === "month") {
        label = date.toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        });
      }

      return {
        label,
        value: parseInt(count) || 0,
        date: date.toISOString(),
      };
    });

    // Waktu aktif pengguna per jam (untuk tampilan jam tetap ada)
    const commentsByHour = await Comment.findAll({
      attributes: [
        [
          Sequelize.fn("DATE_TRUNC", "hour", Sequelize.col("createdAt")),
          "hour",
        ],
        [Sequelize.fn("COUNT", "*"), "count"],
      ],
      where: {
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      },
      group: [Sequelize.fn("DATE_TRUNC", "hour", Sequelize.col("createdAt"))],
      order: [
        [Sequelize.fn("DATE_TRUNC", "hour", Sequelize.col("createdAt")), "ASC"],
      ],
      limit: 24,
    });

    const hourlyActivity = commentsByHour.map((item) => {
      const hour = new Date(item.getDataValue("hour")).getHours();
      return {
        time: hour.toString().padStart(2, "0"),
        activity: parseInt(item.getDataValue("count")),
      };
    });

    // Top contributors berdasarkan jumlah post (exclude admin)
    const topUsers = await User.findAll({
      attributes: [
        "id",
        "fullName",
        [Sequelize.fn("COUNT", Sequelize.col("posts.id")), "postCount"],
      ],
      include: [
        {
          model: Post,
          as: "posts",
          attributes: [],
        },
      ],
      where: {
        role: { [Op.ne]: "admin" },
      },
      group: ["User.id", "User.fullName"],
      order: [[Sequelize.literal('"postCount"'), "DESC"]],
      limit: 5,
      subQuery: false,
    });

    const topContributors = topUsers.map((user) => ({
      id: user.id,
      name: user.fullName,
      posts: parseInt(user.getDataValue("postCount")) || 0,
      points: (parseInt(user.getDataValue("postCount")) || 0) * 10 + 100,
    }));

    res.json({
      totalStudents: totalUsers,
      totalPosts,
      totalInteractions: totalComments,
      avgEngagementRate: parseFloat(avgEngagementRate),
      studentsGrowth: parseFloat(studentsGrowth),
      postsGrowth: parseFloat(postsGrowth),
      interactionsGrowth: parseFloat(interactionsGrowth),
      engagementGrowth: parseFloat(engagementGrowth),
      trendingContent,
      hourlyActivity,
      topContributors,
      // NEW: Enhanced chart data
      chartData: formattedChartData,
      chartMeta: {
        period,
        metric,
        format,
        unit,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Gagal mengambil data analytics" });
  }
});
// GET /admin/dashboard/summary
router.get("/dashboard/summary", async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(now.getMonth() - 1);

    // Total sekarang (periode ini)
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();
    const totalReports = await Report.count();

    // Total bulan lalu
    const prevUsers = await User.count({
      where: { createdAt: { [Op.between]: [lastMonth, now] } },
    });
    const prevPosts = await Post.count({
      where: { createdAt: { [Op.between]: [lastMonth, now] } },
    });
    const prevComments = await Comment.count({
      where: { createdAt: { [Op.between]: [lastMonth, now] } },
    });
    const prevReports = await Report.count({
      where: { createdAt: { [Op.between]: [lastMonth, now] } },
    });

    // Fungsi helper growth
    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      totalUsers,
      usersGrowth: calcGrowth(totalUsers, prevUsers),
      totalPosts,
      postsGrowth: calcGrowth(totalPosts, prevPosts),
      totalComments,
      commentsGrowth: calcGrowth(totalComments, prevComments),
      totalReports,
      reportsGrowth: calcGrowth(totalReports, prevReports),
    });
  } catch (error) {
    console.error("Summary Error:", error);
    res.status(500).json({ message: "Gagal mengambil data summary" });
  }
});

// GET /api/admin/info
// GET /api/admin/info
router.get("/info", async (req, res) => {
  const admin = await User.findByPk(req.user.id);
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  res.json({
    username: admin.username,
    fullName: admin.fullName,
  });
});

// PUT /api/admin/info
router.put("/info", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email tidak valid" });
  }

  const admin = await User.findByPk(req.user.id);
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin.username = email;
  await admin.save();

  res.json({ message: "Email admin berhasil diperbarui" });
});

// PUT
router.put("/platform-settings", async (req, res) => {
  try {
    const { name, description, autoModeration, bannedWords } = req.body;

    const [updatedCount] = await PlatformSetting.update(
      { name, description, autoModeration, bannedWords },
      { where: {} } // karena hanya ada satu baris
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Setting not found" });
    }

    const updatedSetting = await PlatformSetting.findOne();
    res.json({ message: "Updated", data: updatedSetting });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/dashboard/recent-activities
router.get("/dashboard/recent-activities", async (req, res) => {
  try {
    const recentPosts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [
        {
          model: User,
          as: "author", // sesuai alias relasi di model
          attributes: ["fullName", "avatar"],
        },
      ],
    });

    const recentComments = await Comment.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      include: [
        {
          model: User,
          as: "author", // sesuai dengan Comment.belongsTo(User, { as: 'author' })
          attributes: ["fullName", "avatar"],
        },
      ],
    });

    const recentUsers = await User.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["fullName", "avatar", "createdAt"],
    });

    res.json({
      recentPosts,
      recentComments,
      recentUsers,
    });
  } catch (error) {
    console.error("Recent Activities Error:", error);
    res.status(500).json({ message: "Gagal mengambil aktivitas terbaru" });
  }
});

// GET /admin/reports
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "fullName", "avatar"],
        },
        {
          model: Post,
          attributes: ["id", "content", "image", "createdAt", "authorId"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "fullName", "avatar"],
            },
          ],
        },
      ],
    });

    const result = await Promise.all(
      reports.map(async (report) => {
        const post = report.Post;
        if (!post) return report.toJSON(); // jika report tanpa post

        const [commentCount, likeUsers] = await Promise.all([
          Comment.count({ where: { postId: post.id } }),
          post.getLikes(), // ini ambil semua user yang like
        ]);

        return {
          ...report.toJSON(),
          Post: {
            ...post.toJSON(),
            comments: commentCount,
            likes: likeUsers.length,
          },
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Get Reports Error:", error);
    res.status(500).json({ message: "Gagal mengambil laporan" });
  }
});

// POST /admin/reports/:id/review
router.put("/reports/:id/review", async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    report.status = "ditinjau";
    await report.save();

    res.json({ message: "Laporan ditandai sebagai ditinjau" });
  } catch (error) {
    console.error("Review Report Error:", error);
    res.status(500).json({ message: "Gagal memperbarui status laporan" });
  }
});

// PUT /admin/reports/:id/dismiss
router.put("/reports/:id/dismiss", async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    report.status = "resolved";
    await report.save();

    res.json({ message: "Laporan telah ditolak / diselesaikan" });
  } catch (error) {
    console.error("Dismiss Report Error:", error);
    res.status(500).json({ message: "Gagal menolak laporan" });
  }
});

// DELETE /admin/posts/:id
router.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    // Update semua laporan jadi resolved
    await Report.update({ status: "resolved" }, { where: { postId: post.id } });

    // Kirim notifikasi ke pemilik post (sebelum post dihapus)
    const notif = await Notification.create({
      type: "moderation",
      message: `Postingan Anda telah dihapus oleh admin karena melanggar kebijakan.`,
      userId: post.authorId,
      actorId: req.user.id,
      postId: post.id,
    });

    notif.dataValues.actor = {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      avatar: req.user.avatar,
    };

    req.app.get("io").to(`user_${post.authorId}`).emit("notification", notif);

    // Hapus post setelah notifikasi berhasil dibuat
    await post.destroy();

    res.json({ message: "Post berhasil dihapus oleh admin." });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Gagal menghapus post" });
  }
});

module.exports = router;
