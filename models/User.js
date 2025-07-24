const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  bio: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  major: {
    type: DataTypes.STRING,
    allowNull: false
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

module.exports = User;
