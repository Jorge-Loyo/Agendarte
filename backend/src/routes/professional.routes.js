const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professional.controller');

router.get('/', professionalController.getAllProfessionals);
router.get('/:id', professionalController.getProfessionalById);

module.exports = router;