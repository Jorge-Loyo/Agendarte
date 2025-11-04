const { google } = require('googleapis');
const { UserPreference, Professional } = require('../models');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-calendar/callback'
);

const createAppointmentEvent = async ({ appointmentId, professionalId, title, startTime, endTime, description }) => {
  try {
    // Obtener el profesional y sus tokens
    const professional = await Professional.findByPk(professionalId);
    if (!professional) return;

    const userPref = await UserPreference.findOne({ where: { userId: professional.userId } });
    if (!userPref?.googleTokens) {
      console.log('⚠️ Profesional no tiene Google Calendar conectado');
      return;
    }

    const tokens = JSON.parse(userPref.googleTokens);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime,
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    console.log('✅ Evento creado en Google Calendar:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando evento en Google Calendar:', error.message);
    throw error;
  }
};

module.exports = {
  createAppointmentEvent
};