const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  // Profile fields
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 13,
      max: 120
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Height in cm'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Weight in kg'
  },
  fitnessLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  fitnessGoals: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of fitness goals'
  },
  activityLevel: {
    type: DataTypes.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'),
    defaultValue: 'moderately_active'
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  // Health metrics
  currentWeight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  bodyFatPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  nutritionStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sleepStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Workout preferences
  workout_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Workout duration in minutes per session',
    validate: {
      min: 15,
      max: 180
    }
  },
  // Nutrition preferences
  dailyMeals: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Number of meals per day'
  },
  budgetLevel: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    comment: 'Budget level for meal planning'
  },
  foodPreferences: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of food preferences (e.g., healthy, high-protein)'
  },
  foodAllergies: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of food allergies (e.g., seafood, dairy)'
  },
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  onboardingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Admin role
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.calculateBMI = function() {
  const heightInMeters = this.height / 100;
  const currentWeight = this.currentWeight || this.weight;
  return currentWeight / (heightInMeters * heightInMeters);
};

User.prototype.calculateDailyCalories = function() {
  const { age, gender, weight, height, activityLevel } = this;
  const currentWeight = this.currentWeight || weight;
  
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age);
  }
  
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// Virtual for full name
Object.defineProperty(User.prototype, 'fullName', {
  get: function() {
    return `${this.firstName} ${this.lastName}`;
  }
});

module.exports = User;
