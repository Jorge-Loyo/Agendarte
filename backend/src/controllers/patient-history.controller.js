const { Appointment, User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { search, startDate, endDate } = req.query;
    const professionalUserId = req.user.id;

    // Obtener el profesional
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    // Verificar que el paciente existe
    const patient = await User.findByPk(patientId, {
      include: [{ model: Profile, as: 'profile' }]
    });
    if (!patient) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (patient.role !== 'patient') {
      return res.status(400).json({ message: 'El usuario no es un paciente' });
    }

    // Construir filtros
    let whereClause = {
      patientId,
      professionalId: professional.id, // Solo consultas propias
      status: { [Op.in]: ['completed', 'confirmed'] }
    };

    // Filtro por fechas
    if (startDate && endDate) {
      whereClause.appointmentDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Filtro por búsqueda en notas
    if (search) {
      whereClause.notes = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Obtener historial
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [{
        model: Professional,
        as: 'professional',
        include: [{
          model: User,
          as: 'user',
          include: [{ model: Profile, as: 'profile' }]
        }]
      }],
      order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
    });

    const formattedHistory = appointments.map(apt => ({
      id: apt.id,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      status: apt.status,
      notes: apt.notes,
      professional: {
        name: `${apt.professional.user.profile.firstName} ${apt.professional.user.profile.lastName}`,
        specialty: apt.professional.specialty
      }
    }));

    res.json({
      message: 'Historial obtenido exitosamente',
      patient: {
        id: patient.id,
        name: `${patient.profile.firstName} ${patient.profile.lastName}`,
        dni: patient.profile.dni,
        phone: patient.profile.phone,
        email: patient.email
      },
      history: formattedHistory,
      totalConsultations: formattedHistory.length
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getPatientHistory
};