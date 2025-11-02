const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPreference = sequelize.define('UserPreference', {
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
  emailReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'email_reminders'
  },
  whatsappReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'whatsapp_reminders'
  },
  reminderHours: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
    field: 'reminder_hours'
  }
}, {
  tableName: 'user_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserPreference;