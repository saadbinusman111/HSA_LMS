const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false
  },
  schedule: {
    type: DataTypes.STRING, // e.g., "Mon, Wed, Fri - 10:00 AM"
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('online', 'offline'),
    defaultValue: 'offline'
  }
});

module.exports = Class;