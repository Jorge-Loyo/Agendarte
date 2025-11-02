const { Appointment, User, Profile } = require('../models');

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const appointments = await Appointment.findAll({
      where: { patientId: userId },
      include: [{
        model: User,
        as: 'professional',
        include: [{
          model: Profile,
          as: 'profile'
        }]
      }],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    res.json({
      message: 'Turnos obtenidos exitosamente',
      appointments
    });
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getMyAppointments
};