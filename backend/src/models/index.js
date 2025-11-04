const User = require('./User');
const Profile = require('./Profile');
const Professional = require('./Professional');
const Appointment = require('./Appointment');
const Specialty = require('./specialty.model');
const Schedule = require('./Schedule');
const Notification = require('./Notification');
const UserPreference = require('./UserPreference');
const Review = require('./Review');
const ProfessionalPatient = require('./ProfessionalPatient');

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

// Asociaciones Professional - Schedule
Professional.hasMany(Schedule, { 
  foreignKey: 'professionalId', 
  as: 'schedules' 
});
Schedule.belongsTo(Professional, { 
  foreignKey: 'professionalId', 
  as: 'professional' 
});

// Asociaciones User - UserPreference
User.hasOne(UserPreference, { 
  foreignKey: 'userId', 
  as: 'preferences' 
});
UserPreference.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Asociaciones Appointment - Notification
Appointment.hasMany(Notification, { 
  foreignKey: 'appointmentId', 
  as: 'notifications' 
});
Notification.belongsTo(Appointment, { 
  foreignKey: 'appointmentId', 
  as: 'appointment' 
});

// Asociaciones User - Notification
User.hasMany(Notification, { 
  foreignKey: 'userId', 
  as: 'notifications' 
});
Notification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Asociaciones Review
Appointment.hasOne(Review, { 
  foreignKey: 'appointmentId', 
  as: 'review' 
});
Review.belongsTo(Appointment, { 
  foreignKey: 'appointmentId', 
  as: 'appointment' 
});

User.hasMany(Review, { 
  foreignKey: 'patientId', 
  as: 'patientReviews' 
});
Review.belongsTo(User, { 
  foreignKey: 'patientId', 
  as: 'patient' 
});

Professional.hasMany(Review, { 
  foreignKey: 'professionalId', 
  as: 'reviews' 
});
Review.belongsTo(Professional, { 
  foreignKey: 'professionalId', 
  as: 'professional' 
});

// Asociaciones ProfessionalPatient
Professional.belongsToMany(User, {
  through: ProfessionalPatient,
  foreignKey: 'professionalId',
  otherKey: 'patientId',
  as: 'patients'
});

User.belongsToMany(Professional, {
  through: ProfessionalPatient,
  foreignKey: 'patientId',
  otherKey: 'professionalId',
  as: 'professionals'
});

// Asociaciones directas para ProfessionalPatient
ProfessionalPatient.belongsTo(User, {
  foreignKey: 'patientId',
  as: 'patient'
});

ProfessionalPatient.belongsTo(Professional, {
  foreignKey: 'professionalId',
  as: 'professional'
});

module.exports = {
  User,
  Profile,
  Professional,
  Appointment,
  Specialty,
  Schedule,
  Notification,
  UserPreference,
  Review,
  ProfessionalPatient
};