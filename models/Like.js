const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Like extends Model {}

Like.init({}, {
  sequelize,
  modelName: 'PostLikes', // sama dengan nama table yang dipakai di relasi belongsToMany
  timestamps: false
});

module.exports = Like;