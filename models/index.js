const { Post, Comment } = require("./Post");
const Report = require("./Report");
const User = require("./User");
const Userfollowers = require("./userfollowers");

// User.hasMany(Post, { foreignKey: 'userId' });
// Post.belongsTo(User, { foreignKey: 'userId' });

Report.belongsTo(User, { as: "reporter", foreignKey: "reporterId" });
Report.belongsTo(Post, { foreignKey: "postId" });

User.hasMany(Report, { as: "reportsMade", foreignKey: "reporterId" });
Post.hasMany(Report, { foreignKey: "postId" });

// Semua relasi sudah ditulis di Post.js, tidak perlu didefinisikan ulang di sini
module.exports = {
  Post,
  Comment,
  Report,
  User,
  Userfollowers,
};
