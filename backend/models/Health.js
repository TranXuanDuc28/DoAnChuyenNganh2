const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Sleep Record Model
const SleepRecord = sequelize.define('SleepRecord', {
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
  bedtime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  wakeTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  sleepStages: {
    type: DataTypes.JSON,
    defaultValue: {
      deep: 0,
      light: 0,
      rem: 0,
      awake: 0
    },
    comment: 'Sleep stages in minutes'
  },
  quality: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  heartRate: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Heart rate data during sleep'
  },
  source: {
    type: DataTypes.ENUM('manual', 'wearable', 'app'),
    defaultValue: 'manual'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'sleep_records'
});

// Heart Rate Record Model
const HeartRateRecord = sequelize.define('HeartRateRecord', {
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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  heartRate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Heart rate in bpm'
  },
  zone: {
    type: DataTypes.ENUM('resting', 'fat_burn', 'cardio', 'peak', 'max'),
    defaultValue: 'resting'
  },
  context: {
    type: DataTypes.ENUM('rest', 'exercise', 'sleep', 'stress', 'other'),
    defaultValue: 'rest'
  },
  source: {
    type: DataTypes.ENUM('manual', 'wearable', 'app'),
    defaultValue: 'manual'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'heart_rate_records'
});

// Stress Record Model
const StressRecord = sequelize.define('StressRecord', {
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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('low', 'moderate', 'high', 'extreme'),
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  triggers: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of stress triggers'
  },
  symptoms: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of stress symptoms'
  },
  copingStrategies: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of coping strategies'
  },
  heartRateVariability: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'HRV score'
  },
  source: {
    type: DataTypes.ENUM('manual', 'wearable', 'app'),
    defaultValue: 'manual'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'stress_records'
});

// Blood Pressure Record Model
const BloodPressureRecord = sequelize.define('BloodPressureRecord', {
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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  systolic: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Systolic pressure in mmHg'
  },
  diastolic: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Diastolic pressure in mmHg'
  },
  pulse: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Pulse in bpm'
  },
  position: {
    type: DataTypes.ENUM('sitting', 'standing', 'lying'),
    defaultValue: 'sitting'
  },
  context: {
    type: DataTypes.ENUM('rest', 'exercise', 'stress', 'medication', 'other'),
    defaultValue: 'rest'
  },
  source: {
    type: DataTypes.ENUM('manual', 'device', 'app'),
    defaultValue: 'manual'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'blood_pressure_records'
});

// Weight Record Model
const WeightRecord = sequelize.define('WeightRecord', {
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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Weight in kg'
  },
  bodyFatPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  muscleMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Muscle mass in kg'
  },
  boneMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Bone mass in kg'
  },
  waterPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  bmi: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  source: {
    type: DataTypes.ENUM('manual', 'scale', 'app'),
    defaultValue: 'manual'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'weight_records'
});

// Activity Record Model
const ActivityRecord = sequelize.define('ActivityRecord', {
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
  steps: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  distance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Distance in km'
  },
  activeMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Active minutes'
  },
  caloriesBurned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  floors: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  heartRate: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Heart rate data'
  },
  activities: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of activities'
  },
  source: {
    type: DataTypes.ENUM('manual', 'wearable', 'app'),
    defaultValue: 'manual'
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  syncedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity_records'
});

// Breathing Exercise Model
const BreathingExercise = sequelize.define('BreathingExercise', {
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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('4-7-8', 'box_breathing', 'belly_breathing', 'alternate_nostril', 'custom'),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  cycles: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  heartRateBefore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  heartRateAfter: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  stressBefore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  stressAfter: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'breathing_exercises'
});

// Menstrual Cycle Model
const MenstrualCycle = sequelize.define('MenstrualCycle', {
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
  cycleStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cycleEnd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duration in days'
  },
  flow: {
    type: DataTypes.ENUM('light', 'moderate', 'heavy', 'very_heavy'),
    allowNull: false
  },
  symptoms: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of symptoms with severity'
  },
  mood: {
    type: DataTypes.ENUM('excellent', 'good', 'neutral', 'poor', 'terrible'),
    allowNull: true
  },
  energy: {
    type: DataTypes.ENUM('high', 'normal', 'low', 'very_low'),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'menstrual_cycles'
});

// Health Goal Model
const HealthGoal = sequelize.define('HealthGoal', {
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
  type: {
    type: DataTypes.ENUM('weight', 'body_fat', 'muscle_mass', 'steps', 'sleep', 'heart_rate', 'stress', 'blood_pressure'),
    allowNull: false
  },
  targetValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currentValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isAchieved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  achievedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'health_goals'
});

module.exports = {
  SleepRecord,
  HeartRateRecord,
  StressRecord,
  BloodPressureRecord,
  WeightRecord,
  ActivityRecord,
  BreathingExercise,
  MenstrualCycle,
  HealthGoal
};
