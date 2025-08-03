const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class PlatformSetting extends Model {}

PlatformSetting.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    autoModeration: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bannedWords: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
  },
  {
    sequelize,
    modelName: "PlatformSetting",
    tableName: "PlatformSettings",
    timestamps: true,
    updatedAt: "updatedAt",
    createdAt: false,
  }
);

module.exports = PlatformSetting;
