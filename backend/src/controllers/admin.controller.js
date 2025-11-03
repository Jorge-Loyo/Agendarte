const bcrypt = require('bcryptjs');
const { User, Profile, Professional } = require('../models');
const { Op } = require('sequelize');

const getAllUsers = async (req, res) => {
  try {
    // Obtener usuarios básicos primero
    const users = await User.findAll({
      order: [['created_at', 'DESC']]
    });

    // Obtener perfiles y profesionales por separado
    const formattedUsers = [];
    
    for (const user of users) {
      const profile = await Profile.findOne({ where: { userId: user.id } });
      const professional = user.role === 'professional' ? 
        await Professional.findOne({ where: { userId: user.id } }) : null;
      
      formattedUsers.push({
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        profile: profile ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          dni: profile.dni,
          phone: profile.phone
        } : null,
        professional: professional ? {
          specialty: professional.specialty,
          licenseNumber: professional.licenseNumber
        } : null
      });
    }

    res.json({
      message: 'Usuarios obtenidos exitosamente',
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, dni, phone, specialty, licenseNumber } = req.body;

    // Verificar email único
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Verificar DNI único si se proporciona
    if (dni) {
      const existingDNI = await Profile.findOne({ where: { dni } });
      if (existingDNI) {
        return res.status(400).json({ message: 'El DNI ya está registrado' });
      }
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    // Crear perfil
    const profile = await Profile.create({
      userId: user.id,
      firstName,
      lastName,
      dni: dni || null,
      phone: phone || null
    });

    // Si es profesional, crear registro profesional
    if (role === 'professional') {
      await Professional.create({
        userId: user.id,
        specialty: specialty || 'General',
        licenseNumber: licenseNumber || `MP${user.id}`,
        consultationPrice: 5000,
        averageRating: 0,
        totalReviews: 0
      });
    }

    console.log(`👤 Usuario ${role} creado: ${email}`);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName
        }
      }
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({ role, isActive });

    console.log(`🔄 Usuario ${userId} actualizado: role=${role}, active=${isActive}`);

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Soft delete - desactivar usuario
    await user.update({ isActive: false });

    console.log(`🗑️ Usuario ${userId} desactivado`);

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUserFull = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, password, role, firstName, lastName, dni, phone, specialty, licenseNumber } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar usuario
    const updateData = { email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await user.update(updateData);

    // Actualizar perfil
    let profile = await Profile.findOne({ where: { userId } });
    if (profile) {
      await profile.update({ firstName, lastName, dni, phone });
    } else {
      profile = await Profile.create({ userId, firstName, lastName, dni, phone });
    }

    // Actualizar profesional si es necesario
    if (role === 'professional') {
      let professional = await Professional.findOne({ where: { userId } });
      if (professional) {
        await professional.update({ specialty, licenseNumber });
      } else {
        await Professional.create({ userId, specialty, licenseNumber, consultationPrice: 5000 });
      }
    }

    console.log(`🔄 Usuario ${userId} actualizado completamente`);
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserFull,
  deleteUser
};