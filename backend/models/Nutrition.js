const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


// Meal Plan Model
const MealPlan = sequelize.define('MealPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in days'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  meals: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of meals for each day'
  },
  totalCalories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  macronutrients: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Total macronutrients for the plan'
  },
  dietaryRestrictions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of dietary restrictions'
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      cuisine: [],
      dislikes: [],
      allergies: []
    },
    comment: 'User preferences'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  aiGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aiPrompt: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI prompt used to generate this plan'
  }
}, {
  tableName: 'meal_plans'
});


// Food Log Model - Nutrition Diary
const FoodLog = sequelize.define('FoodLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  foodName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  barcode: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Barcode if scanned from product'
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false,
    defaultValue: 'snack'
  },
  servingSize: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '100g'
  },
  servingAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0,
    comment: 'Number of servings consumed'
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  protein: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  carbs: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  fat: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  fiber: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  sugar: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  sodium: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date when food was consumed'
  },
  logTime: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Time when food was consumed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'food_logs',
  underscored: true,
  indexes: [
    {
      fields: ['userId', 'log_date']
    },
    {
      fields: ['barcode']
    }
  ]
});


// Water Intake Model
const WaterIntake = sequelize.define('WaterIntake', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 250, // Standard glass size in ml
    comment: 'Amount in ml'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'water_intakes',
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'date']
    }
  ]
});


// Meal Completion Model - Track completed meals
const MealCompletion = sequelize.define('MealCompletion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  mealPlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'meal_plans',
      key: 'id'
    }
  },
  mealId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Format: dayNumber-mealType (e.g., "1-breakfast")'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'meal_completions',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'meal_plan_id', 'meal_id'],
      name: 'unique_user_meal'
    },
    {
      fields: ['user_id', 'meal_plan_id'],
      name: 'idx_user_meal_plan'
    },
    {
      fields: ['completed_at'],
      name: 'idx_completed_at'
    }
  ]
});


module.exports = {
  MealPlan,
  FoodLog,
  WaterIntake,
  MealCompletion,
};
