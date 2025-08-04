const axios = require("axios");
const PlatformSetting = require("../models/PlatformSetting");

require("dotenv").config();

const groqModerate = async (req, res, next) => {
  const content = req.body.content || "";
  const API_GROQ = process.env.API_GROQ;
  try {
    // 🔍 Ambil setting moderasi
    const setting = await PlatformSetting.findOne();

    // Cek autoModeration aktif
    if (setting?.autoModeration) {
      try {
        // 🔗 Coba moderasi via Groq AI
        const moderationPrompt = `You are a helpful and fair content moderator for a student social platform. 
You must detect if a message violates the rules by containing hate speech, threats, personal attacks, or harassment.
Return only JSON like this: { "flagged": true/false, "reason": "..." }

If the content is safe, set "flagged" to false.
If flagged, give a short reason like "Hate speech", "Spam", "Harassment", etc.`;
        const { data } = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content: moderationPrompt,
              },
              {
                role: "user",
                content,
              },
            ],
            temperature: 0.2,
          },
          {
            headers: {
              Authorization: `Bearer ${API_GROQ}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = JSON.parse(data.choices[0].message.content);

        console.log(result, "Postingan Ditolak");
        if (result.flagged) {
          return res.status(400).json({
            message: "⛔ Postingan ditolak oleh sistem moderasi AI",
            reason: result.reason,
          });
        }
      } catch (err) {
        console.warn(
          "⚠️ Groq moderation failed, fallback ke manual:",
          err.message
        );
        // fallback ke cek bannedWords
        if (setting.bannedWords) {
          const bannedWords = setting.bannedWords
            .split(",")
            .map((w) => w.trim().toLowerCase());
          const contentLower = content.toLowerCase();
          const hasBannedWord = bannedWords.some((w) =>
            contentLower.includes(w)
          );
          if (hasBannedWord) {
            return res.status(400).json({
              message:
                "🚫 Postingan mengandung kata yang dilarang oleh sistem moderasi lokal.",
            });
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error("❌ Moderation Middleware Error:", err.message);
    return res.status(500).json({
      message: "Terjadi kesalahan dalam proses moderasi konten.",
    });
  }
};

module.exports = groqModerate;
