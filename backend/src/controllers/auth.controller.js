const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Profile } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, dni, age, gender, address, phone } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'patient' // Por defecto es paciente
    });

    // Crear perfil
    await Profile.create({
      userId: user.id,
      firstName,
      lastName,
      dni,
      age,
      gender,
      address,
      phone
    });

    // Generar token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
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
      where: { email },
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

module.exports = {
  register,
  login,
  getProfile
};