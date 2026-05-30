const { sequelize } = require('../config/database');
require('../models/User');
require('../models/Health');
require('../models/Workout');
require('../models/Nutrition');
require('../models/AISuggestion');
require('../models/Notification');
require('../models/Pose');
require('../models/BodyMetricsHistory');
require('../models/VideoAnalysis');
require('../models/ImageEvaluation');

const syncDatabase = async () => {
  try {
    console.log('Starting database synchronization with { alter: true }...');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized and indexes applied successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

syncDatabase();
