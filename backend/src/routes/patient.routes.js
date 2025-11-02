const express = require('express');
const router = express.Router();
const { User, Profile } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

// Buscar pacientes (solo para profesionales y admin)
router.get('/search', authenticateToken, authorizeRoles('professional', 'admin'), async (req, res) => {
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
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${q}%` } },
            { lastName: { [Op.iLike]: `%${q}%` } },
            { dni: { [Op.like]: `%${q}%` } }
          ]
        }
      }],
      limit: 10
    });

    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      firstName: patient.profile.firstName,
      lastName: patient.profile.lastName,
      dni: patient.profile.dni,
      phone: patient.profile.phone,
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