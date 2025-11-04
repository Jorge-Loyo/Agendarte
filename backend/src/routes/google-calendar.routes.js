const express = require('express');
const router = express.Router();
const googleCalendarController = require('../controllers/google-calendar.controller');
const { authenticateToken } = require('../middleware/auth');

// Obtener URL de autorización
router.get('/auth-url', authenticateToken, googleCalendarController.getAuthUrl);

// Manejar callback de Google
router.get('/callback', googleCalendarController.handleCallback);

// Obtener calendarios del usuario
router.get('/calendars', authenticateToken, googleCalendarController.getCalendars);

// Obtener eventos del usuario
router.get('/events', authenticateToken, googleCalendarController.getEvents);

// Cerrar sesión de Google
router.post('/logout', authenticateToken, googleCalendarController.logout);

// Crear evento en Google Calendar
router.post('/create-event', authenticateToken, googleCalendarController.createEvent);

// Eliminar evento de Google Calendar
router.delete('/events/:eventId', authenticateToken, googleCalendarController.deleteEvent);

module.exports = router;