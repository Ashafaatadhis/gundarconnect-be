const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Notification extends Model {}

Notification.init({
  type: { type: DataTypes.STRING, allowNull: false }, // like, comment, follow
  message: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.INTEGER, allowNull: false }, // penerima notifikasi
  actorId: { type: DataTypes.INTEGER, allowNull: false }, // pelaku aksi
  postId: { type: DataTypes.INTEGER }, // opsional untuk like/comment
  commentId: { type: DataTypes.INTEGER }, // opsional untuk comment
}, {
  sequelize,
  modelName: 'Notification'
});

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

module.exports = Notification;
