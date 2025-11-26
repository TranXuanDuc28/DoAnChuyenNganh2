const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Model để lưu kết quả đánh giá ảnh tư thế
const ImageEvaluation = sequelize.define('ImageEvaluation', {
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
        field: 'user_id'
    },
    exerciseName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Tên bài tập (vrukshasana, squat, etc.)',
        field: 'exercise_name'
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Điểm đánh giá (0-100)'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Tư thế có đúng không',
        field: 'is_correct'
    },
    feedback: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Mảng các gợi ý cải thiện'
    },
    inputImagePath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Đường dẫn ảnh input gốc',
        field: 'input_image_path'
    },
    resultImagePath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Đường dẫn ảnh kết quả (có skeleton)',
        field: 'result_image_path'
    },
    referenceImagePath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Đường dẫn ảnh tham chiếu',
        field: 'reference_image_path'
    },
    comparisonImagePath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Đường dẫn ảnh so sánh',
        field: 'comparison_image_path'
    },
    keypoints: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Keypoints được phát hiện'
    },
    angles: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Các góc đo được'
    },
    detectedPose: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Tư thế được tự động nhận diện (nếu có)',
        field: 'detected_pose'
    },
    confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Độ tin cậy của nhận diện tự động (0-1)'
    },
    processingTime: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Thời gian xử lý (giây)',
        field: 'processing_time'
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'completed',
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Thông tin bổ sung'
    }
}, {
    tableName: 'image_evaluations',
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['exercise_name'] },
        { fields: ['created_at'] },
        { fields: ['status'] }
    ]
});

module.exports = ImageEvaluation;
