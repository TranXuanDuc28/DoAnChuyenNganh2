const Joi = require('joi');

/**
 * Reusable validation middleware that validates the request body against a Joi schema
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false, // Return all validation errors instead of just the first one
      allowUnknown: true, // Allow fields not defined in the schema
      stripUnknown: false // Do not strip out fields not defined in the schema
    });

    if (error) {
      const errorDetails = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorDetails
      });
    }

    next();
  };
};

// Login Validation Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Register Validation Schema
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  profile: Joi.object({
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    }),
    age: Joi.number().integer().positive().required().messages({
      'number.base': 'Age must be a number',
      'any.required': 'Age is required'
    }),
    gender: Joi.string().required().messages({
      'any.required': 'Gender is required'
    }),
    height: Joi.number().positive().required().messages({
      'number.base': 'Height must be a number',
      'any.required': 'Height is required'
    }),
    weight: Joi.number().positive().required().messages({
      'number.base': 'Weight must be a number',
      'any.required': 'Weight is required'
    }),
    fitnessLevel: Joi.string().required().messages({
      'any.required': 'Fitness level is required'
    }),
    activityLevel: Joi.string().required().messages({
      'any.required': 'Activity level is required'
    })
  }).required().messages({
    'any.required': 'Profile information is required'
  })
});

// Password Change Schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  })
});

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  changePasswordSchema
};
