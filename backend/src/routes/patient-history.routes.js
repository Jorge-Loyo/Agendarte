const express = require('express');
const router = express.Router();
const patientHistoryController = require('../controllers/patient-history.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Solo profesionales pueden acceder al historial
router.get('/:patientId', 
  authenticateToken, 
  authorizeRoles('professional'), 
  patientHistoryController.getPatientHistory
);

module.exports = router;