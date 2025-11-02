const { Appointment, User, Profile, Professional } = require('../models');

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Buscando citas para usuario:', userId);
    
    const appointments = await Appointment.findAll({
      where: { patientId: userId },
      include: [{
        model: Professional,
        as: 'professional',
        include: [{
          model: User,
          as: 'user',
          include: [{
            model: Profile,
            as: 'profile'
          }]
        }]
      }],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    console.log(`📋 Encontradas ${appointments.length} citas para usuario ${userId}`);
    
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

const createAppointment = async (req, res) => {
  try {
    const { professionalId, date, time, notes } = req.body;
    const patientId = req.user.id;
    
    console.log('📅 Creando cita:', { professionalId, date, time, patientId });

    // Verificar que el profesional existe
    const professional = await Professional.findByPk(professionalId);
    if (!professional) {
      return res.status(404).json({
        message: 'Profesional no encontrado'
      });
    }

    // Verificar que el slot esté disponible
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId,
        appointmentDate: date,
        appointmentTime: time,
        status: { [require('sequelize').Op.ne]: 'cancelled' }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'El horario seleccionado ya está ocupado'
      });
    }

    // Crear la cita
    const appointment = await Appointment.create({
      patientId,
      professionalId,
      appointmentDate: date,
      appointmentTime: time,
      status: 'scheduled',
      paymentStatus: 'pending',
      notes: notes || null,
      createdBy: patientId
    });
    
    console.log('✅ Cita creada exitosamente:', appointment.id);

    // Obtener la cita creada con datos del profesional
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [{
        model: Professional,
        as: 'professional',
        include: [{
          model: User,
          as: 'user',
          include: [{
            model: Profile,
            as: 'profile'
          }]
        }]
      }]
    });

    res.status(201).json({
      message: 'Cita agendada exitosamente',
      appointment: createdAppointment
    });
  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  getMyAppointments,
  createAppointment
};