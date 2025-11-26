const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Stores a single pose evaluation event/result
const PoseLog = sequelize.define('PoseLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  exerciseName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  repCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  angles: {
    type: DataTypes.JSON,
    allowNull: true
  },
  keypoints: {
    type: DataTypes.JSON,
    allowNull: true
  },
  rawImageStored: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If original image was stored externally (not in DB)'
  }
}, {
  tableName: 'pose_logs'
});

module.exports = PoseLog;


