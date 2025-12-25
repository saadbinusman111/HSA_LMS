const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('video', 'pdf', 'image', 'link'),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false // Path to file or external URL
  },
  category: {
    type: DataTypes.STRING, // e.g., "Week 1", "Chapter 2"
    defaultValue: "General"
  }
});

module.exports = Material;