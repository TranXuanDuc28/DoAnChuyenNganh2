const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Exercise Model
const Exercise = sequelize.define('Exercise', {
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
  category: {
    type: DataTypes.ENUM('cardio', 'strength', 'flexibility', 'balance', 'sports'),
    allowNull: false
  },
  muscleGroups: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of muscle groups'
  },
  equipment: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of equipment needed'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  instructions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of instruction steps'
  },
  tips: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of tips'
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  caloriesPerMinute: {
    type: DataTypes.FLOAT,
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
  }
}, {
  tableName: 'exercises'
});

// Workout Model
const Workout = sequelize.define('Workout', {
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
  category: {
    type: DataTypes.ENUM('cardio', 'strength', 'flexibility', 'hiit', 'yoga', 'pilates', 'crossfit', 'custom'),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  exercises: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of exercises with sets, reps, etc.'
  },
  estimatedCalories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  muscleGroups: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of muscle groups'
  },
  equipment: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of equipment needed'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of tags'
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
    comment: 'Array of user IDs who liked this workout'
  },
  completedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'workouts'
});

// Workout Session Model
const WorkoutSession = sequelize.define('WorkoutSession', {
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
  workoutId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workouts',
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in minutes'
  },
  exercises: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of exercises with completed sets'
  },
  totalCaloriesBurned: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  heartRate: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Heart rate data during workout'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  mood: {
    type: DataTypes.ENUM('excellent', 'good', 'okay', 'poor', 'terrible'),
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('too_easy', 'just_right', 'challenging', 'too_hard'),
    allowNull: true
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'workout_sessions'
});

// Workout Plan Model
const WorkoutPlan = sequelize.define('WorkoutPlan', {
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
  goal: {
    type: DataTypes.ENUM('weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in weeks'
  },
  frequency: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Workouts per week'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  schedule: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Weekly schedule'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  progress: {
    type: DataTypes.JSON,
    defaultValue: {
      completedWorkouts: 0,
      totalWorkouts: 0,
      averageRating: 0
    },
    comment: 'Progress tracking data'
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
  tableName: 'workout_plans'
});

module.exports = {
  Exercise,
  Workout,
  WorkoutSession,
  WorkoutPlan
};
