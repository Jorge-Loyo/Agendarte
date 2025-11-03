const Joi = require('joi');
const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: errors.array().map(error => error.msg)
    });
  }
  next();
};

// Validadores con express-validator (más seguros)
const validateRegisterSecure = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email debe ser válido'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre debe tener entre 2-50 caracteres y solo letras'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido debe tener entre 2-50 caracteres y solo letras'),
  body('dni')
    .trim()
    .isLength({ min: 7, max: 20 })
    .matches(/^[0-9]+$/)
    .withMessage('DNI debe tener entre 7-20 dígitos'),
  handleValidationErrors
];

const validateLoginSecure = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email debe ser válido'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida'),
  handleValidationErrors
];

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email debe ser válido',
      'any.required': 'Email es requerido'
    }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Contraseña debe tener al menos 8 caracteres',
        'string.pattern.base': 'Contraseña debe contener al menos una mayúscula, una minúscula y un número',
        'any.required': 'Contraseña es requerida'
      }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Nombre debe tener al menos 2 caracteres',
      'string.max': 'Nombre no puede exceder 50 caracteres',
      'any.required': 'Nombre es requerido'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Apellido debe tener al menos 2 caracteres',
      'string.max': 'Apellido no puede exceder 50 caracteres',
      'any.required': 'Apellido es requerido'
    }),
    dni: Joi.string().min(7).max(20).required().messages({
      'string.min': 'DNI debe tener al menos 7 caracteres',
      'string.max': 'DNI no puede exceder 20 caracteres',
      'any.required': 'DNI es requerido'
    }),
    age: Joi.number().integer().min(1).max(120).optional().messages({
      'number.min': 'Edad debe ser mayor a 0',
      'number.max': 'Edad no puede ser mayor a 120'
    }),
    gender: Joi.string().valid('M', 'F', 'Other').optional(),
    address: Joi.string().max(500).optional().messages({
      'string.max': 'Dirección no puede exceder 500 caracteres'
    }),
    phone: Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).max(20).optional().messages({
      'string.pattern.base': 'Teléfono debe contener solo números, espacios, guiones y paréntesis',
      'string.max': 'Teléfono no puede exceder 20 caracteres'
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
  validateLogin,
  validateRegisterSecure,
  validateLoginSecure,
  handleValidationErrors
};