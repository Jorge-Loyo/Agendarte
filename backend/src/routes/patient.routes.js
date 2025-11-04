const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Profile } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

// Obtener todos los pacientes (para profesionales)
router.get('/', authenticateToken, authorizeRoles('professional', 'admin'), async (req, res) => {
  try {
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
      order: [['id', 'ASC']]
    });

    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      firstName: patient.profile?.firstName || 'Sin nombre',
      lastName: patient.profile?.lastName || '',
      dni: patient.profile?.dni || 'Sin DNI',
      phone: patient.profile?.phone || 'Sin teléfono',
      email: patient.email,
      address: patient.profile?.address || '',
      gender: patient.profile?.gender || '',
      birthDate: patient.profile?.birthDate || null
    }));

    res.json(formattedPatients);
  } catch (error) {
    console.error('Error getting patients:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Crear paciente (solo para profesionales)
router.post('/create', authenticateToken, authorizeRoles('professional'), async (req, res) => {
  try {
    const { firstName, lastName, dni, email, phone, birthDate, gender, address } = req.body;

    // Verificar si ya existe el email
    const existingUser = await User.findOne({ 
      where: { email },
      include: [{ model: Profile, as: 'profile' }]
    });
    
    if (existingUser) {
      // Si el usuario ya existe, agregarlo a la cartilla del profesional
      const professionalUserId = req.user.id;
      const { Professional, ProfessionalPatient } = require('../models');
      
      const professional = await Professional.findOne({ where: { userId: professionalUserId } });
      if (professional) {
        await ProfessionalPatient.findOrCreate({
          where: {
            professionalId: professional.id,
            patientId: existingUser.id
          }
        });
      }
      
      console.log(`➕ Paciente existente ${existingUser.id} agregado a cartilla del profesional ${professionalUserId}`);
      
      return res.json({
        message: 'Paciente ya registrado - agregado a tu cartilla',
        patient: {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.profile?.firstName,
          lastName: existingUser.profile?.lastName,
          dni: existingUser.profile?.dni
        },
        existed: true
      });
    }

    // Verificar si ya existe el DNI
    const existingProfile = await Profile.findOne({ where: { dni } });
    if (existingProfile) {
      return res.status(400).json({ message: 'El DNI ya está registrado con otro email' });
    }

    // Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'patient',
      isActive: true
    });

    // Crear perfil
    await Profile.create({
      userId: user.id,
      firstName,
      lastName,
      dni,
      phone: phone || null,
      address: address || null,
      gender: gender || null
    });

    // Agregar el paciente a la cartilla del profesional automáticamente
    const professionalUserId = req.user.id;
    const { Professional, ProfessionalPatient } = require('../models');
    
    const professional = await Professional.findOne({ where: { userId: professionalUserId } });
    if (professional) {
      await ProfessionalPatient.create({
        professionalId: professional.id,
        patientId: user.id
      });
    }
    console.log(`➕ Paciente nuevo ${user.id} agregado automáticamente a cartilla del profesional ${professionalUserId}`);
    
    res.json({
      message: 'Paciente creado exitosamente y agregado a tu cartilla',
      tempPassword,
      patient: {
        id: user.id,
        email,
        firstName,
        lastName,
        dni
      },
      existed: false
    });
  } catch (error) {
    console.error('Error creando paciente:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
});

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