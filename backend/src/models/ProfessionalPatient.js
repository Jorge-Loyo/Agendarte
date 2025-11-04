const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProfessionalPatient = sequelize.define('ProfessionalPatient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  professionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'professional_id'
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'patient_id'
  }
}, {
  tableName: 'professional_patients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['professional_id', 'patient_id']
    }
  ]
});

module.exports = ProfessionalPatient;