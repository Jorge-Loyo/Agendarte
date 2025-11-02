const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Specialty = sequelize.define('Specialty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'specialties',
  timestamps: true
});

module.exports = Specialty;