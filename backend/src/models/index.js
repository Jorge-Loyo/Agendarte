const User = require('./User');
const Profile = require('./Profile');
const Professional = require('./Professional');
const Appointment = require('./Appointment');
const Specialty = require('./specialty.model');

// Asociaciones User - Profile
User.hasOne(Profile, { 
  foreignKey: 'userId', 
  as: 'profile' 
});
Profile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Asociaciones User - Professional
User.hasOne(Professional, { 
  foreignKey: 'userId', 
  as: 'professional' 
});
Professional.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Asociaciones Professional - Appointment
Professional.hasMany(Appointment, { 
  foreignKey: 'professionalId', 
  as: 'appointments' 
});
Appointment.belongsTo(Professional, { 
  foreignKey: 'professionalId', 
  as: 'professional' 
});

// Asociaciones User (Patient) - Appointment
User.hasMany(Appointment, { 
  foreignKey: 'patientId', 
  as: 'patientAppointments' 
});
Appointment.belongsTo(User, { 
  foreignKey: 'patientId', 
  as: 'patient' 
});

// Asociaciones User (Creator) - Appointment
User.hasMany(Appointment, { 
  foreignKey: 'createdBy', 
  as: 'createdAppointments' 
});
Appointment.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

module.exports = {
  User,
  Profile,
  Professional,
  Appointment,
  Specialty
};