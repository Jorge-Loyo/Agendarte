const express = require('express');
const router = express.Router();
const { User, Profile } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

// Buscar pacientes (solo para profesionales y admin)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ patients: [] });
    }

    const patients = await User.findAll({
      where: { 
        role: 'patient',
        isActive: true 
      },
      include: [{
        model: Profile,
        as: 'profile',
        required: false
      }],
      where: {
        role: 'patient',
        isActive: true,
        [Op.or]: [
          { email: { [Op.iLike]: `%${q}%` } },
          { '$profile.firstName$': { [Op.iLike]: `%${q}%` } },
          { '$profile.lastName$': { [Op.iLike]: `%${q}%` } },
          { '$profile.dni$': { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 10
    });

    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      firstName: patient.profile?.firstName || 'Sin nombre',
      lastName: patient.profile?.lastName || '',
      dni: patient.profile?.dni || 'Sin DNI',
      phone: patient.profile?.phone || 'Sin teléfono',
      email: patient.email
    }));

    res.json({ patients: formattedPatients });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;