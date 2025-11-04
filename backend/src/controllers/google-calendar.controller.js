const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-calendar/callback'
);

const getAuthUrl = async (req, res) => {
  try {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user.id // Para identificar al usuario
    });
    
    res.json({
      message: 'URL de autorización generada',
      authUrl
    });
  } catch (error) {
    console.error('Error generando URL:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Guardar tokens en BD (simplificado - usar UserPreference)
    const { UserPreference } = require('../models');
    await UserPreference.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        googleTokens: JSON.stringify(tokens)
      }
    }).then(([pref, created]) => {
      if (!created) {
        pref.update({ googleTokens: JSON.stringify(tokens) });
      }
    });
    
    res.redirect('http://localhost:4200/app/professional-dashboard?calendar=connected');
  } catch (error) {
    console.error('Error en callback:', error);
    res.status(500).json({ message: 'Error procesando autorización' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { appointmentId, title, startTime, endTime, description } = req.body;
    const userId = req.user.id;
    
    // Obtener tokens del usuario
    const { UserPreference } = require('../models');
    const userPref = await UserPreference.findOne({ where: { userId } });
    
    if (!userPref?.googleTokens) {
      return res.status(400).json({ message: 'Google Calendar no conectado' });
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
    
    res.json({
      message: 'Evento creado en Google Calendar',
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ message: 'Error creando evento en Google Calendar' });
  }
};

const getCalendars = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { UserPreference } = require('../models');
    const userPref = await UserPreference.findOne({ where: { userId } });
    
    if (!userPref?.googleTokens) {
      return res.status(400).json({ message: 'Google Calendar no conectado' });
    }
    
    const tokens = JSON.parse(userPref.googleTokens);
    oauth2Client.setCredentials(tokens);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();
    
    res.json({
      message: 'Calendarios obtenidos',
      calendars: response.data.items
    });
  } catch (error) {
    console.error('Error obteniendo calendarios:', error);
    res.status(500).json({ message: 'Error obteniendo calendarios' });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  getCalendars,
  createEvent
};