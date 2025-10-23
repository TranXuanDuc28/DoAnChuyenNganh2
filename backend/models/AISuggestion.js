const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AISuggestion = sequelize.define('AISuggestion', {
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
    type: DataTypes.ENUM('workout', 'nutrition', 'rest', 'mindfulness', 'general'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  relatedData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'e.g., workoutId, mealId, or specific metrics'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActioned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'e.g., user started the suggested workout'
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ai_suggestions'
});

module.exports = AISuggestion;
