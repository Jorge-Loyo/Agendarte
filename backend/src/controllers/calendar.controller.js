const { Professional, Schedule, Appointment, User, Profile } = require('../models');
const { Op } = require('sequelize');

const getProfessionalCalendar = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const { year, month } = req.query;

    // Obtener horarios del profesional
    const schedules = await Schedule.findAll({
      where: { 
        professionalId,
        isActive: true 
      }
    });

    // Obtener citas del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const appointments = await Appointment.findAll({
      where: {
        professionalId,
        appointmentDate: {
          [Op.between]: [startDate, endDate]
        },
        status: { [Op.ne]: 'cancelled' }
      }
    });

    // Generar calendario del mes
    const calendar = generateMonthCalendar(year, month, schedules, appointments);

    res.json({
      message: 'Calendario obtenido exitosamente',
      calendar,
      schedules,
      appointments: appointments.length
    });
  } catch (error) {
    console.error('Error obteniendo calendario:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const generateMonthCalendar = (year, month, schedules, appointments) => {
  const calendar = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Buscar horario para este día
    const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
    
    // Buscar citas para este día
    const dayAppointments = appointments.filter(apt => 
      new Date(apt.appointmentDate).getDate() === day
    );

    let availableSlots = [];
    if (daySchedule) {
      availableSlots = generateTimeSlots(
        daySchedule.startTime,
        daySchedule.endTime,
        daySchedule.consultationDuration,
        dayAppointments
      );
    }

    calendar.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek,
      hasSchedule: !!daySchedule,
      availableSlots: availableSlots.length,
      totalSlots: daySchedule ? Math.floor(
        (parseTime(daySchedule.endTime) - parseTime(daySchedule.startTime)) / 
        (daySchedule.consultationDuration * 60000)
      ) : 0,
      appointments: dayAppointments.length,
      slots: availableSlots
    });
  }
  
  return calendar;
};

const generateTimeSlots = (startTime, endTime, duration, appointments) => {
  const slots = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const durationMs = duration * 60000;

  for (let time = start; time < end; time += durationMs) {
    const slotTime = formatTime(time);
    const isBooked = appointments.some(apt => apt.appointmentTime === slotTime);
    
    slots.push({
      time: slotTime,
      available: !isBooked
    });
  }
  
  return slots;
};

const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 3600000 + minutes * 60000;
};

const formatTime = (ms) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

module.exports = {
  getProfessionalCalendar
};