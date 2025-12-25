const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  month: {
    type: DataTypes.STRING, // e.g., "December"
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('paid', 'pending'),
    defaultValue: 'pending'
  },
  paidDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Fee;