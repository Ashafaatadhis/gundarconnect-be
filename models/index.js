const { Post, Comment } = require('./Post');
const User = require('./User');

// User.hasMany(Post, { foreignKey: 'userId' });
// Post.belongsTo(User, { foreignKey: 'userId' });

// Semua relasi sudah ditulis di Post.js, tidak perlu didefinisikan ulang di sini
module.exports = {
  Post,
  Comment,
  User
};