'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('image_evaluations', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            exercise_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            score: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0
            },
            is_correct: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            feedback: {
                type: Sequelize.JSON,
                allowNull: true
            },
            input_image_path: {
                type: Sequelize.STRING,
                allowNull: true
            },
            result_image_path: {
                type: Sequelize.STRING,
                allowNull: true
            },
            reference_image_path: {
                type: Sequelize.STRING,
                allowNull: true
            },
            comparison_image_path: {
                type: Sequelize.STRING,
                allowNull: true
            },
            keypoints: {
                type: Sequelize.JSON,
                allowNull: true
            },
            angles: {
                type: Sequelize.JSON,
                allowNull: true
            },
            detected_pose: {
                type: Sequelize.STRING,
                allowNull: true
            },
            confidence: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            processing_time: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'failed'),
                defaultValue: 'completed',
                allowNull: false
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: '{}'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Add indexes
        await queryInterface.addIndex('image_evaluations', ['user_id']);
        await queryInterface.addIndex('image_evaluations', ['exercise_name']);
        await queryInterface.addIndex('image_evaluations', ['created_at']);
        await queryInterface.addIndex('image_evaluations', ['status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('image_evaluations');
    }
};
