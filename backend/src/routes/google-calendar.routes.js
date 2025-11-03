const express = require('express');
const router = express.Router();
const googleCalendarController = require('../controllers/google-calendar.controller');
const { authenticateToken } = require('../middleware/auth');

// Obtener URL de autorización
router.get('/auth-url', authenticateToken, googleCalendarController.getAuthUrl);

// Manejar callback de Google
router.get('/callback', googleCalendarController.handleCallback);

// Obtener calendarios del usuario
router.post('/calendars', authenticateToken, googleCalendarController.getCalendars);

// Crear evento en Google Calendar
router.post('/create-event', authenticateToken, googleCalendarController.createEvent);

module.exports = router;