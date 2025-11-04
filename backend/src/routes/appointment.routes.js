const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/my-appointments', authenticateToken, appointmentController.getMyAppointments);
router.post('/', authenticateToken, appointmentController.createAppointment);
router.post('/professional', authenticateToken, appointmentController.createProfessionalAppointment);
router.put('/:id/cancel', authenticateToken, appointmentController.cancelAppointment);
router.put('/:id/reschedule', authenticateToken, appointmentController.rescheduleAppointment);
router.put('/:id/professional-cancel', authenticateToken, appointmentController.cancelProfessionalAppointment);
router.put('/:id/professional-reschedule', authenticateToken, appointmentController.rescheduleProfessionalAppointment);
router.get('/professional-appointments', authenticateToken, appointmentController.getProfessionalAppointments);
router.get('/recent-patients', authenticateToken, appointmentController.getRecentPatients);

module.exports = router;