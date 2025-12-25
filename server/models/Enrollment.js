const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ClassId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Enrollment;