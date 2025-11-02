const express = require('express');
const router = express.Router();
const { Schedule, Professional, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

console.log('Schedule routes loaded');

// Obtener horarios del profesional
router.get('/my-schedules', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const professional = await Professional.findOne({ where: { userId } });
    if (!professional) {
      return res.status(404).json({ message: 'Profesional no encontrado' });
    }

    const schedules = await Schedule.findAll({
      where: { professionalId: professional.id },
      order: [['dayOfWeek', 'ASC']]
    });

    res.json({
      message: 'Horarios obtenidos exitosamente',
      schedules
    });
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Actualizar horarios del profesional
router.put('/my-schedules', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { schedules } = req.body;
    
    let professional = await Professional.findOne({ where: { userId } });
    if (!professional) {
      // Crear profesional si no existe
      professional = await Professional.create({
        userId: userId,
        specialty: 'General',
        licenseNumber: 'MP' + userId,
        bio: 'Profesional de la salud',
        consultationPrice: 5000,
        averageRating: 0,
        totalReviews: 0
      });
    }

    // Eliminar horarios existentes
    await Schedule.destroy({ where: { professionalId: professional.id } });

    // Crear nuevos horarios
    const newSchedules = schedules.map(schedule => ({
      ...schedule,
      professionalId: professional.id
    }));

    await Schedule.bulkCreate(newSchedules);

    res.json({
      message: 'Horarios actualizados exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando horarios:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;