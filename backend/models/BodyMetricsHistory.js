const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BodyMetricsHistory = sequelize.define('BodyMetricsHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Weight in kg'
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Height in cm'
  },
  waistCircumference: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'waist_circumference',
    comment: 'Waist circumference in cm'
  },
  hipCircumference: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'hip_circumference',
    comment: 'Hip circumference in cm'
  },
  bodyFatPercentage: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'body_fat_percentage',
    comment: 'Body fat percentage'
  },
  muscleMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'muscle_mass',
    comment: 'Muscle mass in kg'
  },
  bmi: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Body Mass Index'
  },
  whr: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Waist-to-Hip Ratio'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about this measurement'
  },
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'recorded_at',
    defaultValue: DataTypes.NOW,
    comment: 'When this measurement was taken'
  }
}, {
  tableName: 'body_metrics_history',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_user_recorded',
      fields: ['user_id', 'recorded_at']
    },
    {
      name: 'idx_user_created',
      fields: ['user_id', 'created_at']
    }
  ],
  hooks: {
    beforeCreate: async (metrics) => {
      // Auto-calculate BMI
      if (metrics.height && metrics.weight) {
        const heightInMeters = metrics.height / 100;
        metrics.bmi = metrics.weight / (heightInMeters * heightInMeters);
      }
      // Auto-calculate WHR
      if (metrics.waistCircumference && metrics.hipCircumference) {
        metrics.whr = metrics.waistCircumference / metrics.hipCircumference;
      }
    },
    beforeUpdate: async (metrics) => {
      // Auto-calculate BMI if height or weight changed
      if (metrics.changed('height') || metrics.changed('weight')) {
        if (metrics.height && metrics.weight) {
          const heightInMeters = metrics.height / 100;
          metrics.bmi = metrics.weight / (heightInMeters * heightInMeters);
        }
      }
      // Auto-calculate WHR if waist or hip circumference changed
      if (metrics.changed('waistCircumference') || metrics.changed('hipCircumference')) {
        if (metrics.waistCircumference && metrics.hipCircumference) {
          metrics.whr = metrics.waistCircumference / metrics.hipCircumference;
        }
      }
    }
  }
});

// Instance methods
BodyMetricsHistory.prototype.calculateBMI = function() {
  if (!this.height || !this.weight) {
    return null;
  }
  const heightInMeters = this.height / 100;
  return this.weight / (heightInMeters * heightInMeters);
};

BodyMetricsHistory.prototype.calculateWHR = function() {
  if (!this.waistCircumference || !this.hipCircumference) {
    return null;
  }
  return this.waistCircumference / this.hipCircumference;
};

// Define associations (will be set up after all models are loaded)
BodyMetricsHistory.associate = (models) => {
  BodyMetricsHistory.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = BodyMetricsHistory;

