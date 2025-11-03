const { Appointment, User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

const getProfessionalStats = async (req, res) => {
  try {
    const professionalUserId = req.user.id;
    
    // Obtener el profesional
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Turnos de hoy
    const todayAppointments = await Appointment.count({
      where: {
        professionalId: professional.id,
        appointmentDate: today.toISOString().split('T')[0],
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Turnos confirmados esta semana
    const weeklyConfirmed = await Appointment.count({
      where: {
        professionalId: professional.id,
        appointmentDate: {
          [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        },
        status: 'confirmed'
      }
    });

    // Total turnos esta semana
    const weeklyTotal = await Appointment.count({
      where: {
        professionalId: professional.id,
        appointmentDate: {
          [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Pacientes únicos esta semana
    const weeklyPatients = await Appointment.count({
      where: {
        professionalId: professional.id,
        appointmentDate: {
          [Op.between]: [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0]]
        },
        status: { [Op.ne]: 'cancelled' }
      },
      distinct: true,
      col: 'patientId'
    });

    // Ingresos del mes (turnos pagados)
    const monthlyRevenue = await Appointment.sum('professional.consultationPrice', {
      where: {
        professionalId: professional.id,
        appointmentDate: {
          [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
        },
        paymentStatus: 'paid'
      },
      include: [{
        model: Professional,
        as: 'professional',
        attributes: []
      }]
    });

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      stats: {
        todayAppointments,
        weeklyConfirmed,
        weeklyTotal,
        weeklyPatients,
        monthlyRevenue: monthlyRevenue || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getProfessionalStats
};