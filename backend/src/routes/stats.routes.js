const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Solo profesionales pueden acceder a sus estadísticas
router.get('/professional', 
  authenticateToken, 
  authorizeRoles('professional'), 
  statsController.getProfessionalStats
);

module.exports = router;