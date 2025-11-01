const Joi = require('joi');

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email debe ser válido',
      'any.required': 'Email es requerido'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Contraseña debe tener al menos 8 caracteres',
      'any.required': 'Contraseña es requerida'
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Nombre debe tener al menos 2 caracteres',
      'any.required': 'Nombre es requerido'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Apellido debe tener al menos 2 caracteres',
      'any.required': 'Apellido es requerido'
    }),
    dni: Joi.string().min(7).max(20).optional(),
    age: Joi.number().integer().min(1).max(120).optional(),
    gender: Joi.string().valid('M', 'F', 'Other').optional(),
    address: Joi.string().max(500).optional(),
    phone: Joi.string().max(20).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email debe ser válido',
      'any.required': 'Email es requerido'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Contraseña es requerida'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin
};