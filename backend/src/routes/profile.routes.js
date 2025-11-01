const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User, Profile } = require('../models');

// Actualizar perfil del usuario
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, phone, dni, birthDate, gender, address } = req.body;

    // Actualizar datos del usuario
    await User.update(
      { email },
      { where: { id: userId } }
    );

    // Buscar o crear perfil
    let profile = await Profile.findOne({ where: { userId } });
    
    if (profile) {
      // Actualizar perfil existente
      await profile.update({
        firstName,
        lastName,
        phone,
        dni,
        birthDate,
        gender,
        address
      });
    } else {
      // Crear nuevo perfil
      profile = await Profile.create({
        userId,
        firstName,
        lastName,
        phone,
        dni,
        birthDate,
        gender,
        address
      });
    }

    // Obtener usuario actualizado con perfil
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Profile,
        as: 'profile'
      }]
    });

    res.json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;