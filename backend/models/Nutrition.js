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


module.exports = {
  MealPlan,
};
