const express = require('express');
const router = express.Router();
const googleMeetController = require('../controllers/google-meet.controller');
const { authenticateToken } = require('../middleware/auth');

// Crear reunión de Google Meet
router.post('/create', authenticateToken, googleMeetController.createMeeting);

// Obtener reuniones del usuario
router.get('/meetings', authenticateToken, googleMeetController.getMeetings);

// Eliminar reunión
router.delete('/meetings/:meetingId', authenticateToken, googleMeetController.deleteMeeting);

module.exports = router;