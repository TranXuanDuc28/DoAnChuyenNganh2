'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create junction table for many-to-many relationship
    await queryInterface.createTable('exercise_category_mappings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exercises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exercise_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate mappings
    await queryInterface.addIndex('exercise_category_mappings', ['exercise_id', 'category_id'], {
      unique: true,
      name: 'unique_exercise_category'
    });

    // Migrate existing data from exerciseCategoryId to junction table
    await queryInterface.sequelize.query(`
      INSERT INTO exercise_category_mappings (exercise_id, category_id, created_at, updated_at)
      SELECT id, exercise_category_id, NOW(), NOW()
      FROM exercises
      WHERE exercise_category_id IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('exercise_category_mappings');
  }
};

