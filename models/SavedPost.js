const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { Post } = require('./Post');

class SavedPost extends Model {}

SavedPost.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'SavedPost',
  indexes: [{ unique: true, fields: ['userId', 'postId'] }]
});

// Tambahkan relasi agar bisa include: { model: Post, as: 'post' }
SavedPost.belongsTo(Post, { as: 'post', foreignKey: 'postId' });

module.exports = SavedPost;
