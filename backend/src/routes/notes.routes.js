const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Solo profesionales pueden gestionar notas
router.get('/:appointmentId', 
  authenticateToken, 
  authorizeRoles('professional'), 
  notesController.getAppointmentNotes
);

router.put('/:appointmentId', 
  authenticateToken, 
  authorizeRoles('professional'), 
  notesController.updateAppointmentNotes
);

module.exports = router;