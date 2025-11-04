const { Appointment, User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

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
    
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      status: apt.status,
      paymentStatus: apt.paymentStatus,
      notes: apt.notes,
      professional: {
        id: apt.professional?.id,
        specialty: apt.professional?.specialty,
        consultationPrice: apt.professional?.consultationPrice,
        user: {
          profile: {
            firstName: apt.professional?.user?.profile?.firstName,
            lastName: apt.professional?.user?.profile?.lastName,
            address: apt.professional?.user?.profile?.address
          }
        }
      }
    }));
    
    res.json({
      message: 'Turnos obtenidos exitosamente',
      appointments: formattedAppointments
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

    // Crear notificaciones de recordatorio
    const notificationService = require('../services/notification.service');
    await notificationService.createNotificationsForAppointment(appointment.id);

    // Crear evento en Google Calendar
    try {
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hora
      
      const googleCalendarService = require('../services/google-calendar.service');
      await googleCalendarService.createAppointmentEvent({
        appointmentId: appointment.id,
        professionalId,
        title: `Consulta - Paciente ID: ${patientId}`,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description: notes || 'Consulta médica'
      });
    } catch (gcalError) {
      console.log('⚠️ Google Calendar no disponible:', gcalError.message);
    }

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

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { id, patientId: userId },
      include: [{
        model: Professional,
        as: 'professional',
        include: [{
          model: User,
          as: 'user',
          include: [{ model: Profile, as: 'profile' }]
        }]
      }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'El turno ya está cancelado' });
    }

    // Validar 24hs de anticipación
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        message: 'No se puede cancelar con menos de 24 horas de anticipación'
      });
    }

    await appointment.update({
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''} - Cancelado: ${reason}` : appointment.notes
    });

    // Simular notificación al profesional
    console.log(`📧 Notificación: Turno cancelado para ${appointment.professional.user.profile.firstName}`);

    res.json({
      message: 'Turno cancelado exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { id, patientId: userId },
      include: [{
        model: Professional,
        as: 'professional',
        include: [{
          model: User,
          as: 'user',
          include: [{ model: Profile, as: 'profile' }]
        }]
      }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'No se puede reprogramar un turno cancelado' });
    }

    // Validar 24hs de anticipación
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        message: 'No se puede reprogramar con menos de 24 horas de anticipación'
      });
    }

    // Verificar disponibilidad del nuevo horario
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId: appointment.professionalId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { [Op.ne]: 'cancelled' },
        id: { [Op.ne]: id }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'El nuevo horario no está disponible'
      });
    }

    await appointment.update({
      appointmentDate: newDate,
      appointmentTime: newTime,
      notes: reason ? `${appointment.notes || ''} - Reprogramado: ${reason}` : appointment.notes
    });

    // Crear nuevas notificaciones para el turno reprogramado
    const notificationService = require('../services/notification.service');
    await notificationService.createNotificationsForAppointment(appointment.id);

    console.log(`📧 Notificación: Turno reprogramado para ${appointment.professional.user.profile.firstName}`);

    res.json({
      message: 'Turno reprogramado exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error reprogramando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createProfessionalAppointment = async (req, res) => {
  try {
    const { patientId, date, time, notes } = req.body;
    const professionalUserId = req.user.id;

    // Obtener el profesional
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    // Verificar que el paciente existe
    const patient = await User.findByPk(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Verificar disponibilidad del horario
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId: professional.id,
        appointmentDate: date,
        appointmentTime: time,
        status: { [Op.ne]: 'cancelled' }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'El horario ya está ocupado' });
    }

    // Crear la cita
    const appointment = await Appointment.create({
      patientId,
      professionalId: professional.id,
      appointmentDate: date,
      appointmentTime: time,
      status: 'confirmed', // Confirmado directamente por el profesional
      paymentStatus: 'paid', // Sin pago requerido
      notes: notes || null,
      createdBy: professionalUserId
    });

    console.log(`📅 Cita creada por profesional para paciente ${patientId}`);

    res.status(201).json({
      message: 'Cita agendada exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error creando cita profesional:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const cancelProfessionalAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const professionalUserId = req.user.id;

    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const appointment = await Appointment.findOne({
      where: { id, professionalId: professional.id },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'El turno ya está cancelado' });
    }

    await appointment.update({
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''} - Cancelado por profesional: ${reason}` : appointment.notes
    });

    // Simular notificación al paciente
    console.log(`📧 Notificación: Turno cancelado por profesional para ${appointment.patient.profile.firstName}`);

    res.json({
      message: 'Turno cancelado exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const rescheduleProfessionalAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;
    const professionalUserId = req.user.id;

    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const appointment = await Appointment.findOne({
      where: { id, professionalId: professional.id },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'No se puede reprogramar un turno cancelado' });
    }

    // Verificar disponibilidad del nuevo horario
    const existingAppointment = await Appointment.findOne({
      where: {
        professionalId: professional.id,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { [Op.ne]: 'cancelled' },
        id: { [Op.ne]: id }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'El nuevo horario no está disponible' });
    }

    await appointment.update({
      appointmentDate: newDate,
      appointmentTime: newTime,
      notes: reason ? `${appointment.notes || ''} - Reprogramado por profesional: ${reason}` : appointment.notes
    });

    console.log(`📧 Notificación: Turno reprogramado por profesional para ${appointment.patient.profile.firstName}`);

    res.json({
      message: 'Turno reprogramado exitosamente',
      appointment
    });
  } catch (error) {
    console.error('Error reprogramando turno:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProfessionalAppointments = async (req, res) => {
  try {
    const professionalUserId = req.user.id;
    console.log('🔍 Buscando citas para profesional userId:', professionalUserId);
    
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      console.log('❌ Profesional no encontrado para userId:', professionalUserId);
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    console.log('✅ Profesional encontrado, ID:', professional.id);

    const appointments = await Appointment.findAll({
      where: { 
        professionalId: professional.id,
        status: { [Op.ne]: 'cancelled' }
      },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    console.log(`📅 Encontradas ${appointments.length} citas`);

    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      time: apt.appointmentTime,
      patient: `${apt.patient.profile.firstName} ${apt.patient.profile.lastName}`,
      patientName: `${apt.patient.profile.firstName} ${apt.patient.profile.lastName}`,
      reason: apt.notes || 'Consulta',
      status: apt.status,
      duration: 60,
      appointmentDate: apt.appointmentDate
    }));

    console.log('📤 Enviando citas:', formattedAppointments);

    res.json({
      message: 'Citas obtenidas exitosamente',
      appointments: formattedAppointments
    });
  } catch (error) {
    console.error('Error obteniendo citas del profesional:', error);
    res.status(500).json({ message: 'Error interno del servidor', appointments: [] });
  }
};

const getRecentPatients = async (req, res) => {
  try {
    const professionalUserId = req.user.id;
    
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const recentAppointments = await Appointment.findAll({
      where: { 
        professionalId: professional.id,
        status: 'completed'
      },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }],
      order: [['appointmentDate', 'DESC']],
      limit: 5
    });

    const patients = recentAppointments.map(apt => ({
      id: apt.patient.id,
      name: `${apt.patient.profile.firstName} ${apt.patient.profile.lastName}`,
      lastVisit: apt.appointmentDate,
      condition: apt.notes || 'Consulta general',
      status: 'Atendido'
    }));

    res.json({
      message: 'Pacientes recientes obtenidos exitosamente',
      patients
    });
  } catch (error) {
    console.error('Error obteniendo pacientes recientes:', error);
    res.status(500).json({ message: 'Error interno del servidor', patients: [] });
  }
};

module.exports = {
  getMyAppointments,
  createAppointment,
  createProfessionalAppointment,
  cancelAppointment,
  rescheduleAppointment,
  cancelProfessionalAppointment,
  rescheduleProfessionalAppointment,
  getProfessionalAppointments,
  getRecentPatients
};