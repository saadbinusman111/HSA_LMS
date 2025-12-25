const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  testName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  obtainedMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = Result;