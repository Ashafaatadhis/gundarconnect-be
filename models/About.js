const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const About = sequelize.define('About', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bio1: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio2: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skillsTechnical: {
    type: DataTypes.JSON,
    allowNull: true
  },
  skillsSoft: {
    type: DataTypes.JSON,
    allowNull: true
  },
  skillsLanguages: {
    type: DataTypes.JSON,
    allowNull: true
  },
  experience: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'About',
  timestamps: true
});

module.exports = About;
