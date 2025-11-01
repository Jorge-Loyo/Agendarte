const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Professional = sequelize.define('Professional', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    field: 'license_number'
  },
  specialty: {
    type: DataTypes.STRING(100)
  },
  bio: {
    type: DataTypes.TEXT
  },
  consultationPrice: {
    type: DataTypes.DECIMAL(10, 2),
    field: 'consultation_price'
  },
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
    field: 'average_rating'
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_reviews'
  }
}, {
  tableName: 'professionals',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Professional;