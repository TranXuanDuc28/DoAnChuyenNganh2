const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { sequelize, testConnection } = require('./config/database');
require('dotenv').config();
// build the express app according to the structure above
const app = express();
const httpServer = createServer(app);

// ✅ Cho phép Express tin proxy như ngrok / Expo tunnel
app.set('trust proxy', 1);
// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN_PROD?.split(',') || ['https://yourdomain.com']
    : [
      'http://localhost:3000',  // React Native web
      'http://localhost:3001',  // Admin web
      'http://localhost:8081',  // Expo
      /\.ngrok-free\.dev$/,     // Ngrok tunnels
      /\.ngrok\.io$/            // Ngrok tunnels (old domain)
    ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware - increased limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Database connection and synchronization
const initializeDatabase = async () => {
  try {
    await testConnection();
    // Import all models to register them with Sequelize
    require('./models/User');
    require('./models/Workout');
    require('./models/Nutrition');
    require('./models/AISuggestion');
    require('./models/Notification');
    require('./models/Pose');
    require('./models/BodyMetricsHistory');
    require('./models/VideoAnalysis');
    require('./models/ImageEvaluation');
    require('./models/PoseExercise');

    // Sync database (create tables if they don't exist)
    // Using alter: false to avoid index issues with many foreign keys
    // Tables will be created if they don't exist, but won't be altered
    await sequelize.sync({ alter: false });
    console.log('Database synchronized successfully');

    // Manually ensure unique constraint on email if needed
    // This handles the case where the table exists but doesn't have the unique constraint
    try {
      const [results] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND INDEX_NAME = 'users_email_unique'
      `);

      if (results[0].count === 0) {
        // Check current key count before attempting to add
        const [keyCount] = await sequelize.query(`
          SELECT COUNT(DISTINCT INDEX_NAME) as key_count
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
        `);

        if (keyCount[0].key_count < 64) {
          await sequelize.query(`
            CREATE UNIQUE INDEX users_email_unique ON users(email)
          `);
          console.log('Unique constraint on email column created');
        } else {
          console.warn(`Cannot create unique index on email: table already has ${keyCount[0].key_count} keys (MySQL limit: 64)`);
          console.warn('Email uniqueness will be enforced at application level');
        }
      }
    } catch (error) {
      // Index might already exist, table might not exist yet, or key limit reached
      if (error.code === 'ER_TOO_MANY_KEYS' || error.errno === 1069) {
        console.warn('Cannot create unique index on email: too many keys on users table');
        console.warn('Email uniqueness will be enforced at application level');
      } else if (!error.message.includes('Duplicate key name') && !error.message.includes("doesn't exist")) {
        console.warn('Could not create unique index on email:', error.message);
      }
    }

    // Seed database if in development mode
    if (process.env.NODE_ENV === 'development' && process.argv.includes('--seed')) {
      const { seedDatabase } = require('./seedData');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize database
initializeDatabase();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/workout-plans', require('./routes/workoutPlan'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/body-metrics', require('./routes/bodyMetrics'));
app.use('/api/social', require('./routes/social'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/pose', require('./routes/pose'));
app.use('/api/push', require('./routes/push'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/pose-exercises', require('./routes/adminExercises'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Static serving for category images stored inside the fitness app image folder
const categoryImagesDir = path.join(__dirname, '..', 'fitness-app', 'image');
app.use('/static/category-images', express.static(categoryImagesDir));

app.use('/api/video-analysis', require('./routes/videoAnalysis'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.SOCKET_ORIGIN_PROD?.split(',') || ['https://yourdomain.com']
      : process.env.SOCKET_ORIGIN_DEV?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Import and setup WebSocket handlers
require('./websocket/poseSocket')(io);

// Setup cron jobs for automated tasks
const cron = require('node-cron');
const reminderService = require('./services/reminderService');

// Run workout reminder check every 2 minutes (FOR TESTING)
// Change to '0 9 * * *' for daily at 9:00 AM in production
cron.schedule('*/2 * * * *', async () => {
  console.log('Running scheduled workout reminder check...');
  try {
    await reminderService.scheduleReminders();
  } catch (error) {
    console.error('Error in scheduled reminder check:', error);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh" // Vietnam timezone
});

console.log('Cron jobs initialized - Workout reminders will run every 2 minutes (TESTING MODE)');

const PORT = process.env.PORT || 5000;

// Set server timeout to 5 minutes (300 seconds) for long-running AI operations
// This allows Gemini AI to complete workout/meal plan generation without timeout
httpServer.timeout = 300000; // 5 minutes in milliseconds
httpServer.keepAliveTimeout = 310000; // Slightly longer than timeout
httpServer.headersTimeout = 320000; // Slightly longer than keepAliveTimeout

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Server timeout set to 5 minutes for AI operations`);
});

module.exports = { app, io };
