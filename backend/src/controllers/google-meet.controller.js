const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback'
);

const createMeeting = async (req, res) => {
  try {
    const { title, startTime, endTime, description, attendees } = req.body;
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
      attendees: attendees ? attendees.map(email => ({ email })) : [],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
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
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;
    
    res.json({
      message: 'Reunión de Google Meet creada exitosamente',
      eventId: response.data.id,
      meetLink: meetLink,
      eventLink: response.data.htmlLink,
      meeting: {
        id: response.data.id,
        title: response.data.summary,
        startTime: response.data.start.dateTime,
        endTime: response.data.end.dateTime,
        meetLink: meetLink
      }
    });
  } catch (error) {
    console.error('Error creando reunión:', error);
    res.status(500).json({ message: 'Error creando reunión de Google Meet' });
  }
};

const getMeetings = async (req, res) => {
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
    
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const meetings = response.data.items
      .filter(event => event.conferenceData?.entryPoints)
      .map(event => ({
        id: event.id,
        title: event.summary,
        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        meetLink: event.conferenceData.entryPoints[0]?.uri,
        description: event.description,
        attendees: event.attendees?.map(att => att.email) || []
      }));
    
    res.json({
      message: 'Reuniones obtenidas exitosamente',
      meetings
    });
  } catch (error) {
    console.error('Error obteniendo reuniones:', error);
    res.status(500).json({ message: 'Error obteniendo reuniones' });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const userId = req.user.id;
    
    const { UserPreference } = require('../models');
    const userPref = await UserPreference.findOne({ where: { userId } });
    
    if (!userPref?.googleTokens) {
      return res.status(400).json({ message: 'Google Calendar no conectado' });
    }
    
    const tokens = JSON.parse(userPref.googleTokens);
    oauth2Client.setCredentials(tokens);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: meetingId,
      sendUpdates: 'all'
    });
    
    res.json({
      message: 'Reunión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando reunión:', error);
    res.status(500).json({ message: 'Error eliminando reunión' });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  deleteMeeting
};