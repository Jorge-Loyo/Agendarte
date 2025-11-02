const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { UserPreference } = require('../models');

// Obtener preferencias de notificación del usuario
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let preferences = await UserPreference.findOne({ where: { userId } });
    
    if (!preferences) {
      preferences = await UserPreference.create({
        userId,
        emailReminders: true,
        whatsappReminders: false,
        reminderHours: 24
      });
    }

    res.json({
      message: 'Preferencias obtenidas exitosamente',
      preferences
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Actualizar preferencias de notificación
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailReminders, whatsappReminders, reminderHours } = req.body;

    let preferences = await UserPreference.findOne({ where: { userId } });
    
    if (preferences) {
      await preferences.update({
        emailReminders,
        whatsappReminders,
        reminderHours
      });
    } else {
      preferences = await UserPreference.create({
        userId,
        emailReminders,
        whatsappReminders,
        reminderHours
      });
    }

    res.json({
      message: 'Preferencias actualizadas exitosamente',
      preferences
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;