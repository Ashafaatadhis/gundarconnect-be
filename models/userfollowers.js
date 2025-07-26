const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

class UserFollowers extends Model {}

UserFollowers.init(
  {
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserFollowers",
    tableName: "UserFollowers",
  }
);

// Relasi ke User yang melakukan follow
UserFollowers.belongsTo(User, {
  foreignKey: "followerId",
  as: "follower",
  onDelete: "CASCADE",
});

// Relasi ke User yang di-follow
UserFollowers.belongsTo(User, {
  foreignKey: "followingId",
  as: "following",
  onDelete: "CASCADE",
});

module.exports = UserFollowers;
