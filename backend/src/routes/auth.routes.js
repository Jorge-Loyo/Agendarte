const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateRegisterSecure, validateLoginSecure } = require('../middleware/validation');
const { loginLimiter, registerLimiter } = require('../middleware/security');

// Rutas públicas con rate limiting
router.post('/register', registerLimiter, validateRegisterSecure, authController.register);
router.post('/login', loginLimiter, validateLoginSecure, authController.login);

// Rutas protegidas
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;