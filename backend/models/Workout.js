const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExerciseCategory = sequelize.define('ExerciseCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  englishName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'english_name'
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url'
  },
  imageKey: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_key',
    comment: 'Maps to local asset key on mobile client'
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  backgroundColor: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'background_color'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'display_order'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'exercise_categories'
});

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
  exerciseCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'exercise_category_id',
    references: {
      model: 'exercise_categories',
      key: 'id'
    }
  },
  muscleGroups: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of muscle groups',
    get() {
      const rawValue = this.getDataValue('muscleGroups');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      if (typeof rawValue === 'string') {
        try {
          const parsed = JSON.parse(rawValue);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    }
  },
  equipment: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of equipment needed',
    get() {
      const rawValue = this.getDataValue('equipment');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      if (typeof rawValue === 'string') {
        try {
          const parsed = JSON.parse(rawValue);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    }
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

// Workout Plan Day Model - Chi tiết từng ngày tập trong kế hoạch
const WorkoutPlanDay = sequelize.define('WorkoutPlanDay', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workoutPlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'workout_plan_id',
    references: {
      model: 'workout_plans',
      key: 'id'
    }
  },
  dayNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'day_number',
    comment: 'Day number in the plan (1, 2, 3, ...)'
  },
  dayName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'day_name',
    comment: 'E.g., "Day 1 - Chest & Triceps"'
  },
  focusArea: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'focus_area',
    comment: 'E.g., "Upper Body", "Cardio", "Legs"'
  },
  exercises: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of exercise objects with exerciseId, sets, reps, duration, rest'
  },
  totalDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'total_duration',
    comment: 'Total duration in minutes'
  },
  estimatedCalories: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'estimated_calories'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes or tips for this day'
  },
  isRestDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_rest_day'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  }
}, {
  tableName: 'workout_plan_days'
});

// Workout Plan Day Exercise Model - Bảng trung gian liên kết days với exercises
const WorkoutPlanDayExercise = sequelize.define('WorkoutPlanDayExercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workoutPlanDayId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'workout_plan_day_id'
  },
  exerciseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'exercise_id'
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_index',
    comment: 'Order of exercise in the day'
  },
  sets: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  reps: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g., "10-12", "15", "AMRAP"'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in seconds for time-based exercises'
  },
  restSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    field: 'rest_seconds',
    comment: 'Rest time between sets in seconds'
  },
  weight: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Weight to use, e.g., "bodyweight", "10kg", "moderate"'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes for this exercise'
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_completed',
    comment: 'Whether this exercise has been completed'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
    comment: 'Timestamp when the exercise was completed'
  }
}, {
  tableName: 'workout_plan_day_exercises',
  indexes: [
    {
      name: 'wpde_uniq', // Short unique constraint name
      unique: true,
      fields: ['workout_plan_day_id', 'exercise_id']
    },
    {
      name: 'wpde_order', // Index for ordering
      fields: ['workout_plan_day_id', 'order_index']
    }
  ]
});

// Relationships
WorkoutPlan.hasMany(WorkoutPlanDay, {
  foreignKey: 'workout_plan_id',
  as: 'days'
});

WorkoutPlanDay.belongsTo(WorkoutPlan, {
  foreignKey: 'workout_plan_id',
  as: 'workoutPlan'
});

// Many-to-Many relationship between WorkoutPlanDay and Exercise
WorkoutPlanDay.belongsToMany(Exercise, {
  through: WorkoutPlanDayExercise,
  foreignKey: 'workout_plan_day_id',
  otherKey: 'exercise_id',
  as: 'exerciseList'
});

Exercise.belongsToMany(WorkoutPlanDay, {
  through: WorkoutPlanDayExercise,
  foreignKey: 'exercise_id',
  otherKey: 'workout_plan_day_id',
  as: 'workoutPlanDays'
});

// Direct access to junction table
WorkoutPlanDay.hasMany(WorkoutPlanDayExercise, {
  foreignKey: 'workout_plan_day_id',
  as: 'dayExercises'
});

WorkoutPlanDayExercise.belongsTo(WorkoutPlanDay, {
  foreignKey: 'workout_plan_day_id',
  as: 'workoutPlanDay',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

WorkoutPlanDayExercise.belongsTo(Exercise, {
  foreignKey: 'exercise_id',
  as: 'exercise',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Exercise.hasMany(WorkoutPlanDayExercise, {
  foreignKey: 'exercise_id',
  as: 'planDayExercises'
});

// Many-to-Many relationship between Exercise and ExerciseCategory
ExerciseCategory.belongsToMany(Exercise, {
  through: 'exercise_category_mappings',
  foreignKey: 'category_id',
  otherKey: 'exercise_id',
  as: 'exercises'
});

Exercise.belongsToMany(ExerciseCategory, {
  through: 'exercise_category_mappings',
  foreignKey: 'exercise_id',
  otherKey: 'category_id',
  as: 'categories'
});

module.exports = {
  ExerciseCategory,
  Exercise,
  Workout,
  WorkoutSession,
  WorkoutPlan,
  WorkoutPlanDay,
  WorkoutPlanDayExercise
};
