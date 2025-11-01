const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Rutas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Rutas protegidas
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;