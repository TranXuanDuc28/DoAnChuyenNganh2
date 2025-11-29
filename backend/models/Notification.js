const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
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
        },
        onDelete: 'CASCADE'
    },
    type: {
        type: DataTypes.ENUM('workout_reminder', 'achievement', 'plan_update', 'general'),
        allowNull: false,
        defaultValue: 'general'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    data: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Additional notification data'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'notifications',
    timestamps: true
});

// Define associations
Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
};

module.exports = Notification;
