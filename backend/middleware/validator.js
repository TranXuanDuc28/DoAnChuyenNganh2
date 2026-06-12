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

// Body Metrics Validation Schema
const addMetricsSchema = Joi.object({
  weight: Joi.number().positive().required().messages({
    'number.base': 'Weight must be a number',
    'number.positive': 'Weight must be a positive number',
    'any.required': 'Weight is required'
  }),
  bodyFatPercentage: Joi.number().min(0).max(100).optional(),
  muscleMass: Joi.number().positive().optional(),
  waistCircumference: Joi.number().positive().optional(),
  hipCircumference: Joi.number().positive().optional()
});

// Food Log Validation Schema
const addFoodLogSchema = Joi.object({
  foodName: Joi.string().required().messages({
    'any.required': 'Food name is required'
  }),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required().messages({
    'any.required': 'Meal type is required',
    'any.only': 'Meal type must be breakfast, lunch, dinner, or snack'
  }),
  servingSize: Joi.string().optional(),
  servingAmount: Joi.number().positive().optional(),
  calories: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  carbs: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),
  logDate: Joi.string().optional()
});

// Water Intake Schema
const addWaterIntakeSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'Water amount must be a number',
    'number.positive': 'Water amount must be a positive number',
    'any.required': 'Water amount is required'
  }),
  date: Joi.string().optional()
});

// Meal Completion Schema
const markMealCompletionSchema = Joi.object({
  mealPlanId: Joi.number().integer().required().messages({
    'any.required': 'Meal plan ID is required'
  }),
  mealId: Joi.required().messages({
    'any.required': 'Meal ID is required'
  })
});

// Social Comment Schema
const createCommentSchema = Joi.object({
  comment: Joi.string().required().messages({
    'any.required': 'Comment is required'
  })
});

// Share Achievement Schema
const shareAchievementSchema = Joi.object({
  type: Joi.string().required().messages({
    'any.required': 'Achievement type is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Achievement description is required'
  }),
  value: Joi.any().optional(),
  unit: Joi.string().optional()
});

// Update User Profile Schema
const updateUserProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  age: Joi.number().integer().positive().optional(),
  gender: Joi.string().optional(),
  height: Joi.number().positive().optional(),
  weight: Joi.number().positive().optional(),
  fitnessLevel: Joi.string().optional(),
  fitnessGoals: Joi.any().optional(),
  activityLevel: Joi.string().optional(),
  workoutDuration: Joi.number().positive().allow(null).optional(),
  targetWeight: Joi.number().positive().allow(null).optional(),
  waistCircumference: Joi.number().positive().allow(null).optional(),
  hipCircumference: Joi.number().positive().allow(null).optional(),
  bodyFatPercentage: Joi.number().positive().allow(null).optional()
});

// Generate Workout Plan Schema
const generateWorkoutPlanSchema = Joi.object({
  duration: Joi.number().integer().positive().optional(),
  frequency: Joi.number().integer().positive().optional(),
  goal: Joi.string().optional(),
  focusAreas: Joi.array().items(Joi.string()).optional()
});

// Complete Workout Session Schema
const completeWorkoutSessionSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  mood: Joi.string().optional(),
  difficulty: Joi.string().optional(),
  notes: Joi.string().allow('').optional()
});

// AI Chat Schema
const chatSchema = Joi.object({
  message: Joi.string().required().messages({
    'any.required': 'Message is required'
  }),
  history: Joi.array().items(Joi.object()).optional()
});

// Register Push Token Schema
const registerPushTokenSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Push token is required'
  })
});

// Evaluate Pose (Manual/Hybrid) Schema
const evaluatePoseSchema = Joi.object({
  exerciseName: Joi.string().required().messages({
    'any.required': 'exerciseName is required'
  }),
  keypoints: Joi.array().optional(),
  imageBase64: Joi.string().optional(),
  user_id: Joi.any().optional()
});

// Evaluate Pose Python Schema
const evaluatePosePythonSchema = Joi.object({
  imageBase64: Joi.string().required().messages({
    'any.required': 'imageBase64 is required'
  })
});

// Mark Notifications Read Schema
const markNotificationsReadSchema = Joi.object({
  notificationIds: Joi.array().items(Joi.any()).required().messages({
    'any.required': 'notificationIds array is required'
  })
});

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  addMetricsSchema,
  addFoodLogSchema,
  addWaterIntakeSchema,
  markMealCompletionSchema,
  createCommentSchema,
  shareAchievementSchema,
  updateUserProfileSchema,
  generateWorkoutPlanSchema,
  completeWorkoutSessionSchema,
  chatSchema,
  registerPushTokenSchema,
  evaluatePoseSchema,
  evaluatePosePythonSchema,
  markNotificationsReadSchema
};



