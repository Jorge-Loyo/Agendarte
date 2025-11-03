const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Crear evento de cita en Google Calendar
  async createAppointmentEvent(appointmentData, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: `Consulta - ${appointmentData.professionalName}`,
        description: `Cita médica con ${appointmentData.professionalName}\nEspecialidad: ${appointmentData.specialty}\nPaciente: ${appointmentData.patientName}`,
        start: {
          dateTime: `${appointmentData.date}T${appointmentData.time}`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: this.calculateEndTime(appointmentData.date, appointmentData.time, appointmentData.duration || 30),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        attendees: [
          { email: appointmentData.patientEmail },
          { email: appointmentData.professionalEmail }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 horas antes
            { method: 'popup', minutes: 120 }, // 2 horas antes
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error creando evento en Google Calendar:', error);
      throw error;
    }
  }

  // Calcular hora de fin basada en duración
  calculateEndTime(date, startTime, durationMinutes) {
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (durationMinutes * 60000));
    return endDateTime.toISOString().slice(0, 19);
  }

  // Actualizar evento existente
  async updateAppointmentEvent(eventId, appointmentData, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: `Consulta - ${appointmentData.professionalName} (${appointmentData.status})`,
        description: `Cita médica con ${appointmentData.professionalName}\nEspecialidad: ${appointmentData.specialty}\nPaciente: ${appointmentData.patientName}\nEstado: ${appointmentData.status}`,
        start: {
          dateTime: `${appointmentData.date}T${appointmentData.time}`,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: this.calculateEndTime(appointmentData.date, appointmentData.time, appointmentData.duration || 30),
          timeZone: 'America/Argentina/Buenos_Aires',
        }
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error actualizando evento en Google Calendar:', error);
      throw error;
    }
  }

  // Eliminar evento
  async deleteAppointmentEvent(eventId, accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return true;
    } catch (error) {
      console.error('Error eliminando evento en Google Calendar:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();