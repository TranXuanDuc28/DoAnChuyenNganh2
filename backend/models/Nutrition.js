const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Food Model
const Food = sequelize.define('Food', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
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
    unique: true
  },
  servingSize: {
    type: DataTypes.STRING,
    allowNull: false
  },
  servingSizeGrams: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  nutrition: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Complete nutrition information'
  },
  category: {
    type: DataTypes.ENUM('fruits', 'vegetables', 'grains', 'protein', 'dairy', 'fats', 'beverages', 'snacks', 'desserts', 'condiments', 'other'),
    allowNull: false
  },
  allergens: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of allergens'
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'foods'
});

// Meal Model
const Meal = sequelize.define('Meal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ingredients: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of ingredients with amounts'
  },
  servings: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Preparation time in minutes'
  },
  cookingTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Cooking time in minutes'
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy'
  },
  instructions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of cooking instructions'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of tags'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  likes: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of user IDs who liked this meal'
  },
  category: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink'),
    allowNull: false
  }
}, {
  tableName: 'meals'
});

// Nutrition Entry Model
const NutritionEntry = sequelize.define('NutritionEntry', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false
  },
  foodId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'foods',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Amount in grams'
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'g'
  },
  mealId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'meals',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  loggedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'nutrition_entries'
});

// Nutrition Goal Model
const NutritionGoal = sequelize.define('NutritionGoal', {
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
  goalType: {
    type: DataTypes.ENUM('weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'performance'),
    allowNull: false
  },
  targetCalories: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  macronutrients: {
    type: DataTypes.JSON,
    defaultValue: {
      protein: { percentage: 25, grams: 0 },
      carbohydrates: { percentage: 45, grams: 0 },
      fat: { percentage: 30, grams: 0 }
    },
    comment: 'Macronutrient goals'
  },
  micronutrients: {
    type: DataTypes.JSON,
    defaultValue: {
      fiber: 25,
      sodium: 2300,
      sugar: 50
    },
    comment: 'Micronutrient goals'
  },
  waterIntake: {
    type: DataTypes.INTEGER,
    defaultValue: 2000,
    comment: 'Water intake goal in ml'
  },
  mealTiming: {
    type: DataTypes.JSON,
    defaultValue: {
      breakfast: 25,
      lunch: 35,
      dinner: 30,
      snacks: 10
    },
    comment: 'Meal timing percentages'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'nutrition_goals'
});

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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Amount in ml'
  },
  loggedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'water_intakes'
});

module.exports = {
  Food,
  Meal,
  NutritionEntry,
  NutritionGoal,
  MealPlan,
  WaterIntake
};
