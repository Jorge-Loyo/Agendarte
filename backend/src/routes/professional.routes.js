const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professional.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', professionalController.getAllProfessionals);
router.get('/my-patients', authenticateToken, authorizeRoles('professional'), professionalController.getMyPatients);
router.delete('/remove-patient/:patientId', authenticateToken, authorizeRoles('professional'), professionalController.removePatientFromCartilla);
router.get('/:id', professionalController.getProfessionalById);

module.exports = router;