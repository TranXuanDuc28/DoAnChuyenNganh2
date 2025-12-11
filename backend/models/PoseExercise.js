const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PoseExercise = sequelize.define('PoseExercise', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    exercise_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Unique identifier (e.g., Tree_Pose, push-ups)'
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Display name'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Exercise description'
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Emoji or icon identifier'
    },
    color: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Primary color hex code'
    },
    gradient_start: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Gradient start color'
    },
    gradient_end: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Gradient end color'
    },
    mode: {
        type: DataTypes.ENUM('system', 'image', 'video'),
        allowNull: false,
        defaultValue: 'image',
        comment: 'Exercise type: system (start feature), image (yoga poses), video (dynamic exercises)'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether exercise is visible in app'
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Sort order for display'
    }
}, {
    tableName: 'pose_exercises',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'idx_active_order',
            fields: ['is_active', 'display_order']
        }
    ]
});

// Class methods
PoseExercise.getActiveExercises = async function () {
    return await this.findAll({
        where: { is_active: true },
        order: [['display_order', 'ASC']],
        attributes: {
            exclude: ['created_at', 'updated_at']
        }
    });
};

PoseExercise.getExerciseById = async function (exerciseId) {
    return await this.findOne({
        where: { exercise_id: exerciseId }
    });
};

PoseExercise.getAllExercises = async function () {
    return await this.findAll({
        order: [['display_order', 'ASC']]
    });
};

module.exports = PoseExercise;
