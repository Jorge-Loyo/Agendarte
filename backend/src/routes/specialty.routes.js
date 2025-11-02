const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialty.controller');

// Rutas para especialidades
router.get('/', specialtyController.getAllSpecialties);
router.post('/', specialtyController.createSpecialty);
router.put('/:id', specialtyController.updateSpecialty);
router.delete('/:id', specialtyController.deleteSpecialty);

module.exports = router;