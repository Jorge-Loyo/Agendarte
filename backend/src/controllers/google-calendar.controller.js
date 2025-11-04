const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback'
);

const getAuthUrl = async (req, res) => {
  try {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    
    console.log('🔧 REDIRECT_URI configurada:', process.env.GOOGLE_REDIRECT_URI);
    console.log('🔧 OAuth2Client redirect_uri:', oauth2Client._clientId);
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user.id,
      prompt: 'select_account'
    });
    
    console.log('🔗 URL generada:', authUrl);
    
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
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('Error de autorización:', error);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error de Conexión</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fff5f5; }
            .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 400px; }
            .btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
          </style>
        </head>
        <body>
          <h1>❌ Error de Conexión</h1>
          <div class="error">
            <h3>No se pudo conectar con Google Calendar</h3>
            <p>Error: ${error}</p>
            <p>Por favor, intenta nuevamente.</p>
          </div>
          <a href="http://localhost:4200/app/professional-dashboard" class="btn">🔙 Volver al Dashboard</a>
          <script>
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
        </html>
      `);
    }
    
    if (!code) {
      console.error('No se recibió código de autorización');
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error de Conexión</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fff5f5; }
            .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 400px; }
            .btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
          </style>
        </head>
        <body>
          <h1>❌ Error de Conexión</h1>
          <div class="error">
            <h3>No se pudo conectar con Google Calendar</h3>
            <p>No se recibió código de autorización.</p>
            <p>Por favor, intenta nuevamente.</p>
          </div>
          <a href="http://localhost:4200/app/professional-dashboard" class="btn">🔙 Volver al Dashboard</a>
          <script>
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
        </html>
      `);
    }
    
    const userId = state;
    console.log('🔄 Procesando callback para usuario:', userId);
    
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Tokens obtenidos exitosamente');
    
    // Guardar tokens en BD
    const { UserPreference } = require('../models');
    const [pref, created] = await UserPreference.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        googleTokens: JSON.stringify(tokens)
      }
    });
    
    if (!created) {
      await pref.update({ googleTokens: JSON.stringify(tokens) });
    }
    
    console.log('✅ Tokens guardados en BD');
    
    res.redirect('http://localhost:4200/google-auth?success=true');
  } catch (error) {
    console.error('Error en callback:', error);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error de Conexión</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #fff5f5; }
          .error { background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 400px; }
          .btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; margin: 10px; }
        </style>
      </head>
      <body>
        <h1>❌ Error de Conexión</h1>
        <div class="error">
          <h3>No se pudo conectar con Google Calendar</h3>
          <p>Error interno del servidor.</p>
          <p>Por favor, intenta nuevamente.</p>
        </div>
        <a href="http://localhost:4200/app/professional-dashboard" class="btn">🔙 Volver al Dashboard</a>
        <script>
          setTimeout(() => {
            window.close();
          }, 5000);
        </script>
      </body>
      </html>
    `);
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

const getEvents = async (req, res) => {
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
    
    // Obtener eventos de los próximos 30 días
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
    
    res.json({
      message: 'Eventos obtenidos',
      events: response.data.items || []
    });
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ message: 'Error obteniendo eventos' });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🚪 Cerrando sesión Google para usuario:', userId);
    
    // Eliminar tokens de Google de la BD
    const { UserPreference } = require('../models');
    const userPref = await UserPreference.findOne({ where: { userId } });
    
    if (userPref) {
      await userPref.update({ googleTokens: null });
      console.log('✅ Tokens eliminados de BD');
    } else {
      console.log('⚠️ No se encontraron preferencias de usuario');
    }
    
    res.json({
      message: 'Sesión de Google cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    res.status(500).json({ message: 'Error cerrando sesión: ' + error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
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
      eventId: decodeURIComponent(eventId)
    });
    

    res.json({
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {

    res.status(500).json({ message: 'Error eliminando evento de Google Calendar', error: error.message });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  getCalendars,
  getEvents,
  logout,
  createEvent,
  deleteEvent
};