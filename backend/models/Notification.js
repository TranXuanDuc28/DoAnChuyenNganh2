const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('reminder', 'achievement', 'social', 'system', 'ai_suggestion'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'For scheduled reminders'
  },
  relatedData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'e.g., workoutId, friendRequestId'
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;
