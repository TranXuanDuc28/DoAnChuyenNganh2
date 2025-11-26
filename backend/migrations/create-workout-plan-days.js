const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function createWorkoutPlanDaysTable() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('workout_plan_days')) {
      console.log('✓ Table workout_plan_days already exists');
      return;
    }

    // Create workout_plan_days table
    await queryInterface.createTable('workout_plan_days', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      workout_plan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'workout_plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Day number in the plan (1, 2, 3, ...)'
      },
      day_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'E.g., "Day 1 - Chest & Triceps"'
      },
      focus_area: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'E.g., "Upper Body", "Cardio", "Legs"'
      },
      exercises: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of exercise objects with exerciseId, sets, reps, duration, rest'
      },
      total_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Total duration in minutes'
      },
      estimated_calories: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes or tips for this day'
      },
      is_rest_day: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    console.log('✓ Created table: workout_plan_days');

    // Add index on workout_plan_id for faster queries
    await queryInterface.addIndex('workout_plan_days', ['workout_plan_id'], {
      name: 'idx_workout_plan_days_plan_id'
    });

    console.log('✓ Added index on workout_plan_id');

  } catch (error) {
    console.error('Error creating workout_plan_days table:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createWorkoutPlanDaysTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createWorkoutPlanDaysTable;

