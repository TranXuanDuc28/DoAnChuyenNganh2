const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Model để lưu kết quả phân tích video từ PoseRAC
const VideoAnalysis = sequelize.define('VideoAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: { // ← sửa lại tên field ở đây
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  exerciseName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tên động tác được nhận diện (squat, push_up, etc.)'
  },
  repetitionCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Số lần lặp lại động tác'
  },
  inputVideoPath: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Đường dẫn đến video input gốc'
  },
  outputVideoPath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Đường dẫn đến video output đã được xử lý (có skeleton overlay)'
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL công khai để truy cập video output (nếu được lưu trên cloud storage)'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Thời lượng video (giây)'
  },
  fps: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FPS của video'
  },
  resolution: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Độ phân giải video (ví dụ: "1280x720")'
  },
  processingTime: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Thời gian xử lý (giây)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Thông báo lỗi nếu xử lý thất bại'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Thông tin bổ sung (thresholds, confidence scores, etc.)'
  }
}, {
  tableName: 'video_analyses',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['exerciseName']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = VideoAnalysis;

