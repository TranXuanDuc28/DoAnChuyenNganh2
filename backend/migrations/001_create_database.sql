-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS fitness_app;
USE fitness_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 13 AND age <= 120),
    gender ENUM('male', 'female', 'other') NOT NULL,
    height FLOAT NOT NULL COMMENT 'Height in cm',
    weight FLOAT NOT NULL COMMENT 'Weight in kg',
    fitnessLevel ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    fitnessGoals JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of fitness goals',
    activityLevel ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') DEFAULT 'moderately_active',
    profileImage VARCHAR(255),
    bio TEXT CHECK (CHAR_LENGTH(bio) <= 500),
    currentWeight FLOAT,
    bodyFatPercentage FLOAT,
    muscleMass FLOAT,
    restingHeartRate INT,
    bloodPressureSystolic INT,
    bloodPressureDiastolic INT,
    healthMetricsLastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
    units ENUM('metric', 'imperial') DEFAULT 'metric',
    workoutReminders BOOLEAN DEFAULT TRUE,
    nutritionReminders BOOLEAN DEFAULT TRUE,
    progressUpdates BOOLEAN DEFAULT TRUE,
    socialUpdates BOOLEAN DEFAULT TRUE,
    profileVisibility ENUM('public', 'friends', 'private') DEFAULT 'friends',
    shareProgress BOOLEAN DEFAULT FALSE,
    appleHealthEnabled BOOLEAN DEFAULT FALSE,
    appleHealthConnectedAt DATETIME,
    googleFitEnabled BOOLEAN DEFAULT FALSE,
    googleFitConnectedAt DATETIME,
    fitbitEnabled BOOLEAN DEFAULT FALSE,
    fitbitConnectedAt DATETIME,
    wearables JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of wearable devices',
    friends JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of friend user IDs',
    friendRequests JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of friend requests',
    achievements JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of achievements',
    workoutStreak INT DEFAULT 0,
    nutritionStreak INT DEFAULT 0,
    sleepStreak INT DEFAULT 0,
    subscriptionPlan ENUM('free', 'premium') DEFAULT 'free',
    subscriptionStartDate DATETIME,
    subscriptionEndDate DATETIME,
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME,
    onboardingCompleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('cardio', 'strength', 'flexibility', 'balance', 'sports') NOT NULL,
    muscleGroups JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of muscle groups',
    equipment JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of equipment needed',
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    instructions JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of instruction steps',
    tips JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of tips',
    videoUrl VARCHAR(255),
    imageUrl VARCHAR(255),
    duration INT COMMENT 'Duration in minutes',
    caloriesPerMinute FLOAT,
    isCustom BOOLEAN DEFAULT FALSE,
    createdBy INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('cardio', 'strength', 'flexibility', 'hiit', 'yoga', 'pilates', 'crossfit', 'custom') NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    exercises JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of exercises with sets, reps, etc.',
    estimatedCalories INT,
    muscleGroups JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of muscle groups',
    equipment JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of equipment needed',
    tags JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of tags',
    isCustom BOOLEAN DEFAULT FALSE,
    createdBy INT,
    isPublic BOOLEAN DEFAULT TRUE,
    likes JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of user IDs who liked this workout',
    completedCount INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    workoutId INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME,
    duration INT COMMENT 'Duration in minutes',
    exercises JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of exercises with completed sets',
    totalCaloriesBurned INT,
    heartRate JSON COMMENT 'Heart rate data during workout',
    notes TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    mood ENUM('excellent', 'good', 'okay', 'poor', 'terrible'),
    difficulty ENUM('too_easy', 'just_right', 'challenging', 'too_hard'),
    isCompleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workoutId) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS workout_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goal ENUM('weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness') NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in weeks',
    frequency INT NOT NULL COMMENT 'Workouts per week',
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    schedule JSON DEFAULT (JSON_ARRAY()) COMMENT 'Weekly schedule',
    isActive BOOLEAN DEFAULT TRUE,
    startDate DATETIME,
    endDate DATETIME,
    progress JSON DEFAULT (JSON_OBJECT('completedWorkouts', 0, 'totalWorkouts', 0, 'averageRating', 0)) COMMENT 'Progress tracking data',
    aiGenerated BOOLEAN DEFAULT FALSE,
    aiPrompt TEXT COMMENT 'AI prompt used to generate this plan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create foods table
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    barcode VARCHAR(255) UNIQUE,
    servingSize VARCHAR(255) NOT NULL,
    servingSizeGrams FLOAT NOT NULL,
    nutrition JSON NOT NULL COMMENT 'Complete nutrition information',
    category ENUM('fruits', 'vegetables', 'grains', 'protein', 'dairy', 'fats', 'beverages', 'snacks', 'desserts', 'condiments', 'other') NOT NULL,
    allergens JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of allergens',
    isCustom BOOLEAN DEFAULT FALSE,
    createdBy INT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of ingredients with amounts',
    servings INT DEFAULT 1,
    preparationTime INT COMMENT 'Preparation time in minutes',
    cookingTime INT COMMENT 'Cooking time in minutes',
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    instructions JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of cooking instructions',
    tags JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of tags',
    imageUrl VARCHAR(255),
    isCustom BOOLEAN DEFAULT FALSE,
    createdBy INT,
    isPublic BOOLEAN DEFAULT TRUE,
    likes JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of user IDs who liked this meal',
    category ENUM('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Create nutrition_entries table
CREATE TABLE IF NOT EXISTS nutrition_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    mealType ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    foodId INT NOT NULL,
    amount FLOAT NOT NULL COMMENT 'Amount in grams',
    unit VARCHAR(10) DEFAULT 'g',
    mealId INT,
    notes TEXT,
    loggedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (foodId) REFERENCES foods(id) ON DELETE CASCADE,
    FOREIGN KEY (mealId) REFERENCES meals(id) ON DELETE SET NULL
);

-- Create nutrition_goals table
CREATE TABLE IF NOT EXISTS nutrition_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goalType ENUM('weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'performance') NOT NULL,
    targetCalories INT NOT NULL,
    macronutrients JSON DEFAULT (JSON_OBJECT('protein', JSON_OBJECT('percentage', 25, 'grams', 0), 'carbohydrates', JSON_OBJECT('percentage', 45, 'grams', 0), 'fat', JSON_OBJECT('percentage', 30, 'grams', 0))) COMMENT 'Macronutrient goals',
    micronutrients JSON DEFAULT (JSON_OBJECT('fiber', 25, 'sodium', 2300, 'sugar', 50)) COMMENT 'Micronutrient goals',
    waterIntake INT DEFAULT 2000 COMMENT 'Water intake goal in ml',
    mealTiming JSON DEFAULT (JSON_OBJECT('breakfast', 25, 'lunch', 35, 'dinner', 30, 'snacks', 10)) COMMENT 'Meal timing percentages',
    isActive BOOLEAN DEFAULT TRUE,
    startDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    endDate DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL COMMENT 'Duration in days',
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    meals JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of meals for each day',
    totalCalories INT,
    macronutrients JSON COMMENT 'Total macronutrients for the plan',
    dietaryRestrictions JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of dietary restrictions',
    preferences JSON DEFAULT (JSON_OBJECT('cuisine', JSON_ARRAY(), 'dislikes', JSON_ARRAY(), 'allergies', JSON_ARRAY())) COMMENT 'User preferences',
    isActive BOOLEAN DEFAULT TRUE,
    aiGenerated BOOLEAN DEFAULT FALSE,
    aiPrompt TEXT COMMENT 'AI prompt used to generate this plan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create water_intakes table
CREATE TABLE IF NOT EXISTS water_intakes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    amount INT NOT NULL COMMENT 'Amount in ml',
    loggedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create health-related tables
CREATE TABLE IF NOT EXISTS sleep_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    bedtime DATETIME NOT NULL,
    wakeTime DATETIME NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    sleepStages JSON DEFAULT (JSON_OBJECT('deep', 0, 'light', 0, 'rem', 0, 'awake', 0)) COMMENT 'Sleep stages in minutes',
    quality ENUM('excellent', 'good', 'fair', 'poor') NOT NULL,
    notes TEXT,
    heartRate JSON COMMENT 'Heart rate data during sleep',
    source ENUM('manual', 'wearable', 'app') DEFAULT 'manual',
    deviceId VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS heart_rate_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    heartRate INT NOT NULL COMMENT 'Heart rate in bpm',
    zone ENUM('resting', 'fat_burn', 'cardio', 'peak', 'max') DEFAULT 'resting',
    context ENUM('rest', 'exercise', 'sleep', 'stress', 'other') DEFAULT 'rest',
    source ENUM('manual', 'wearable', 'app') DEFAULT 'manual',
    deviceId VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stress_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    level ENUM('low', 'moderate', 'high', 'extreme') NOT NULL,
    score INT NOT NULL CHECK (score >= 1 AND score <= 10),
    triggers JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of stress triggers',
    symptoms JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of stress symptoms',
    copingStrategies JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of coping strategies',
    heartRateVariability FLOAT COMMENT 'HRV score',
    source ENUM('manual', 'wearable', 'app') DEFAULT 'manual',
    deviceId VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blood_pressure_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    systolic INT NOT NULL COMMENT 'Systolic pressure in mmHg',
    diastolic INT NOT NULL COMMENT 'Diastolic pressure in mmHg',
    pulse INT COMMENT 'Pulse in bpm',
    position ENUM('sitting', 'standing', 'lying') DEFAULT 'sitting',
    context ENUM('rest', 'exercise', 'stress', 'medication', 'other') DEFAULT 'rest',
    source ENUM('manual', 'device', 'app') DEFAULT 'manual',
    deviceId VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weight_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    weight FLOAT NOT NULL COMMENT 'Weight in kg',
    bodyFatPercentage FLOAT,
    muscleMass FLOAT COMMENT 'Muscle mass in kg',
    boneMass FLOAT COMMENT 'Bone mass in kg',
    waterPercentage FLOAT,
    bmi FLOAT,
    source ENUM('manual', 'scale', 'app') DEFAULT 'manual',
    deviceId VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    steps INT DEFAULT 0,
    distance FLOAT DEFAULT 0 COMMENT 'Distance in km',
    activeMinutes INT DEFAULT 0 COMMENT 'Active minutes',
    caloriesBurned INT DEFAULT 0,
    floors INT DEFAULT 0,
    heartRate JSON COMMENT 'Heart rate data',
    activities JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of activities',
    source ENUM('manual', 'wearable', 'app') DEFAULT 'manual',
    deviceId VARCHAR(255),
    syncedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS breathing_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    type ENUM('4-7-8', 'box_breathing', 'belly_breathing', 'alternate_nostril', 'custom') NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    cycles INT DEFAULT 1,
    heartRateBefore INT,
    heartRateAfter INT,
    stressBefore INT CHECK (stressBefore >= 1 AND stressBefore <= 10),
    stressAfter INT CHECK (stressAfter >= 1 AND stressAfter <= 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menstrual_cycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cycleStart DATETIME NOT NULL,
    cycleEnd DATETIME,
    duration INT COMMENT 'Duration in days',
    flow ENUM('light', 'moderate', 'heavy', 'very_heavy') NOT NULL,
    symptoms JSON DEFAULT (JSON_ARRAY()) COMMENT 'Array of symptoms with severity',
    mood ENUM('excellent', 'good', 'neutral', 'poor', 'terrible'),
    energy ENUM('high', 'normal', 'low', 'very_low'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS health_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('weight', 'body_fat', 'muscle_mass', 'steps', 'sleep', 'heart_rate', 'stress', 'blood_pressure') NOT NULL,
    targetValue FLOAT NOT NULL,
    currentValue FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    targetDate DATETIME NOT NULL,
    isAchieved BOOLEAN DEFAULT FALSE,
    achievedAt DATETIME,
    isActive BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

