const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);
router.post('/', authenticateToken, appointmentController.createAppointment);
router.put('/:id/cancel', authenticateToken, appointmentController.cancelAppointment);
router.put('/:id/reschedule', authenticateToken, appointmentController.rescheduleAppointment);

module.exports = router;