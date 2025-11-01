const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Usuario no válido o inactivo' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Token inválido' 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'No tienes permisos para esta acción'
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};