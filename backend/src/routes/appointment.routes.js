const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);

module.exports = router;