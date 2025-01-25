const Joi = require('joi');

// Schémas de validation
const schemas = {
  register: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.min': 'Le nom d\'utilisateur doit contenir au moins 3 caractères',
        'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères',
        'any.required': 'Le nom d\'utilisateur est requis'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'email n\'est pas valide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Le mot de passe est requis'
      }),
    firstName: Joi.string()
      .allow('')
      .optional(),
    lastName: Joi.string()
      .allow('')
      .optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'email n\'est pas valide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Le mot de passe est requis'
      })
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Le token est requis'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
        'any.required': 'Le mot de passe est requis'
      })
  })
};

// Middleware de validation
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Erreur de validation',
        errors
      });
    }
    
    next();
  };
};

// Export des middlewares de validation
module.exports = {
  validateRegister: validateRequest(schemas.register),
  validateLogin: validateRequest(schemas.login),
  validateResetPassword: validateRequest(schemas.resetPassword)
}; 