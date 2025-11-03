const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');

// Simulación de envío de email (en producción usar nodemailer)
const sendConfirmationEmail = async (email, firstName) => {
  console.log(`📧 Email de confirmación enviado a: ${email}`);
  console.log(`Hola ${firstName}, bienvenido a Agendarte!`);
  console.log('Tu cuenta ha sido creada exitosamente.');
  // En producción: implementar con nodemailer, SendGrid, etc.
  return true;
};

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, dni, birthDate, gender, address, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado',
        field: 'email'
      });
    }

    // Verificar si el DNI ya existe (obligatorio)
    if (!dni) {
      return res.status(400).json({
        message: 'El DNI es requerido',
        field: 'dni'
      });
    }

    const existingDNI = await Profile.findOne({ where: { dni } });
    if (existingDNI) {
      return res.status(400).json({
        message: 'El DNI ya está registrado',
        field: 'dni'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'patient'
    });

    // Crear perfil
    const profile = await Profile.create({
      userId: user.id,
      firstName,
      lastName,
      dni,
      birthDate: birthDate || null,
      gender: gender || null,
      address: address || null,
      phone: phone || null
    });

    // Enviar email de confirmación
    await sendConfirmationEmail(email, firstName);

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Revisa tu email para confirmar tu cuenta.',
      token,
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
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() },
      include: [{
        model: Profile,
        as: 'profile'
      }]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Usuario inactivo'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Profile,
        as: 'profile'
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Buscar usuario con contraseña
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Contraseña actual incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await user.update({ password: hashedNewPassword });

    res.json({
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};