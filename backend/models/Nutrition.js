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
  calories: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  protein: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  carbs: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fat: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fiber: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sugar: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sodium: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  servingSize: {
    type: DataTypes.STRING,
    defaultValue: '100g'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isCustom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'foods'
});

// Nutrition Entry Model (Records of consumed food)
const NutritionEntry = sequelize.define('NutritionEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
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
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false
  },
  servingAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 1
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  loggedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'nutrition_entries'
});

// Food Log Model (More flexible, flat log for scans and plans)
const FoodLog = sequelize.define('FoodLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
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
    allowNull: true
  },
  mealType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  servingSize: {
    type: DataTypes.STRING,
    defaultValue: '100g'
  },
  servingAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 1
  },
  calories: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  protein: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  carbs: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fat: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fiber: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sugar: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sodium: {
    type: DataTypes.FLOAT,
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
    defaultValue: DataTypes.NOW
  },
  logTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'food_logs'
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
    allowNull: false
  },
  targetCalories: {
    type: DataTypes.INTEGER,
    defaultValue: 2000
  },
  macronutrients: {
    type: DataTypes.JSON,
    defaultValue: {
      protein: { percentage: 25, grams: 125 },
      carbohydrates: { percentage: 45, grams: 225 },
      fat: { percentage: 30, grams: 67 }
    }
  },
  waterIntake: {
    type: DataTypes.INTEGER,
    defaultValue: 2000,
    comment: 'Target water intake in ml'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'nutrition_goals'
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
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Amount in ml'
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  loggedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'water_intake'
});

// Associations
NutritionEntry.belongsTo(Food, { foreignKey: 'foodId' });
Food.hasMany(NutritionEntry, { foreignKey: 'foodId' });

module.exports = {
  MealPlan,
  Food,
  NutritionEntry,
  NutritionGoal,
  WaterIntake,
  FoodLog
};
