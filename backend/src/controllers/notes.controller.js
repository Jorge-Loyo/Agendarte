const { Appointment, User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

const updateAppointmentNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;
    const professionalUserId = req.user.id;

    // Obtener el profesional
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    // Buscar la cita
    const appointment = await Appointment.findOne({
      where: { 
        id: appointmentId, 
        professionalId: professional.id 
      }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    // Verificar que se puede editar (mismo día)
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = appointment.appointmentDate;
    
    if (appointmentDate !== today && appointment.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Solo se pueden editar notas el mismo día de la consulta o en citas completadas' 
      });
    }

    // Actualizar notas
    await appointment.update({
      notes: notes,
      updatedAt: new Date()
    });

    console.log(`📝 Notas actualizadas para cita ${appointmentId}`);

    res.json({
      message: 'Notas guardadas exitosamente',
      appointment: {
        id: appointment.id,
        notes: appointment.notes,
        updatedAt: appointment.updatedAt
      }
    });
  } catch (error) {
    console.error('Error actualizando notas:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getAppointmentNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const professionalUserId = req.user.id;

    // Obtener el profesional
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    // Buscar la cita con datos del paciente
    const appointment = await Appointment.findOne({
      where: { 
        id: appointmentId, 
        professionalId: professional.id 
      },
      include: [{
        model: User,
        as: 'patient',
        include: [{ model: Profile, as: 'profile' }]
      }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({
      message: 'Notas obtenidas exitosamente',
      appointment: {
        id: appointment.id,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        status: appointment.status,
        notes: appointment.notes,
        updatedAt: appointment.updatedAt,
        patient: {
          name: `${appointment.patient.profile.firstName} ${appointment.patient.profile.lastName}`,
          dni: appointment.patient.profile.dni
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo notas:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  updateAppointmentNotes,
  getAppointmentNotes
};