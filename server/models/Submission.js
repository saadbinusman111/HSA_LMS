const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'graded'),
    defaultValue: 'submitted'
  }
});

module.exports = Submission;