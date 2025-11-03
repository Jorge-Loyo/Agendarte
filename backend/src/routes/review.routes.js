const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Crear reseña (solo pacientes)
router.post('/', 
  authenticateToken, 
  authorizeRoles('patient'), 
  reviewController.createReview
);

// Obtener citas completadas para reseñar
router.get('/appointments-for-review', 
  authenticateToken, 
  authorizeRoles('patient'), 
  reviewController.getCompletedAppointmentsForReview
);

// Obtener reseñas de un profesional
router.get('/professional/:professionalId', 
  reviewController.getProfessionalReviews
);

module.exports = router;