const User = require('../models/User');
const { Workout, WorkoutPlan } = require('../models/Workout');
const { MealPlan } = require('../models/Nutrition');
const AISuggestion = require('../models/AISuggestion');
const mealPlanService = require('./mealPlanService');

// --- Helper Functions ---

/**
 * Calculates recommended daily calories based on user data.
 * @param {User} user - The user instance.
 * @returns {number} Recommended daily calories.
 */
const getRecommendedCalories = (user) => {
  const baseCalories = user.calculateDailyCalories();
  const goal = user.fitnessGoals[0] || 'general_fitness'; // Assume first goal is primary

  switch (goal) {
    case 'weight_loss':
      return baseCalories - 500; // Caloric deficit
    case 'weight_gain':
      return baseCalories + 500; // Caloric surplus
    case 'muscle_gain':
      return baseCalories + 300;
    default:
      return baseCalories; // Maintenance
  }
};

/**
 * Generates a workout suggestion based on user's fitness level and goals.
 * @param {User} user - The user instance.
 * @returns {Object} A workout suggestion object.
 */
const generateWorkoutSuggestion = (user) => {
  const { fitnessLevel, fitnessGoals } = user;
  let suggestion = {
    type: 'workout',
    title: 'Time to Get Moving!',
    description: 'A balanced workout routine is key. How about a full-body strength session today?',
    priority: 'high'
  };

  if (fitnessGoals.includes('weight_loss')) {
    suggestion.title = 'Cardio Blast';
    suggestion.description = 'Focus on burning calories today. A 30-minute HIIT session or a 45-minute run would be perfect to reach your goals.';
  } else if (fitnessGoals.includes('muscle_gain')) {
    suggestion.title = 'Strength Building Day';
    suggestion.description = `Today is a great day to build muscle. Focus on compound lifts like squats, deadlifts, and bench press. Your ${fitnessLevel} level suggests aiming for 3-4 sets of 8-12 reps.`;
  } else if (fitnessGoals.includes('endurance')) {
    suggestion.title = 'Boost Your Endurance';
    suggestion.description = 'Let\'s improve your stamina. A long, steady-state cardio session like jogging or cycling for 60 minutes is on the agenda.';
  }

  return suggestion;
};

/**
 * Generates a nutrition suggestion.
 * @param {User} user - The user instance.
 * @returns {Object} A nutrition suggestion object.
 */
const generateNutritionSuggestion = (user) => {
  const recommendedCalories = getRecommendedCalories(user);
  return {
    type: 'nutrition',
    title: 'Fuel Your Body Right',
    description: `Based on your goals, aim for around ${recommendedCalories} calories today. Focus on lean proteins and complex carbs to keep your energy levels stable.`,
    priority: 'high'
  };
};

/**
 * Generates a rest and recovery suggestion.
 * @param {User} user - The user instance.
 * @param {Array} recentWorkouts - A list of recent workout sessions.
 * @returns {Object|null} A rest suggestion or null if not needed.
 */
const generateRestSuggestion = (user, recentWorkouts = []) => {
  // Simple logic: suggest rest if user worked out > 4 times in the last 7 days.
  if (recentWorkouts.length > 4) {
    return {
      type: 'rest',
      title: 'Rest and Recover',
      description: 'You\'ve been working hard! Remember that recovery is just as important as training. Take a rest day to let your muscles rebuild.',
      priority: 'medium'
    };
  }
  return null;
};


// --- Main Service Functions ---

/**
 * Generates a daily summary of AI suggestions for a user.
 * This function should be called daily for each user (e.g., by a cron job).
 * @param {number} userId - The ID of the user.
 */
const generateDailySummary = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // In a real app, you'd fetch recent workouts, sleep data, etc.
  // const recentWorkouts = await WorkoutSession.findAll({ where: { userId }, limit: 7, order: [['startTime', 'DESC']] });

  const suggestions = [];

  // 1. Workout Suggestion
  suggestions.push(generateWorkoutSuggestion(user));

  // 2. Nutrition Suggestion
  suggestions.push(generateNutritionSuggestion(user));

  // 3. Rest Suggestion (conditionally)
  const restSuggestion = generateRestSuggestion(user);
  if (restSuggestion) {
    suggestions.push(restSuggestion);
  }

  // 4. General Mindfulness/Hydration tip
  suggestions.push({
    type: 'mindfulness',
    title: 'Mindful Moment',
    description: 'Take 5 minutes today for some deep breathing or meditation. It helps reduce stress and improve focus.',
    priority: 'low'
  });

  // Save suggestions to the database
  const suggestionPromises = suggestions.map(s => AISuggestion.create({ ...s, userId }));
  await Promise.all(suggestionPromises);

  return suggestions;
};

/**
 * Generates a personalized workout plan.
 * @param {number} userId - The ID of the user.
 * @param {Object} options - Options like duration, frequency, goal.
 * @returns {WorkoutPlan} The newly created workout plan.
 */
const createWorkoutPlan = async (userId, options = {}) => {
  // This is a placeholder for a more complex ML/rule-based generator.
  // For now, it creates a generic plan based on the user's primary goal.
  const user = await User.findByPk(userId);
  const {
    duration = 4, // weeks
    frequency = 3, // days per week
    goal = user.fitnessGoals[0] || 'general_fitness'
  } = options;

  // In a real implementation, you would query your 'exercises' table
  // to build a detailed schedule based on the goal and user's level.
  const schedule = {
    "Monday": "Full Body Strength",
    "Wednesday": "Cardio & Core",
    "Friday": "Full Body Strength"
  };

  const plan = await WorkoutPlan.create({
    userId,
    name: `AI-Generated ${goal.replace('_', ' ')} Plan`,
    description: `A ${duration}-week plan to help you achieve your goal of ${goal}.`,
    goal,
    duration,
    frequency,
    difficulty: user.fitnessLevel,
    schedule,
    aiGenerated: true,
  });

  return plan;
};

/**
 * Generates a personalized meal plan using LLM (Gemini AI) directly.
 * @param {number} userId - The ID of the user.
 * @param {Object} options - Options for meal plan generation
 * @returns {MealPlan} The newly created meal plan.
 */
const createMealPlan = async (userId, options = {}) => {
  try {
    console.log('Creating meal plan for user:', userId);
    
    // Use the new LLM-based meal plan service
    const result = await mealPlanService.generateMealPlan(userId, {
      duration: options.duration || 7,
      mealsPerDay: options.mealsPerDay || 4,
      dietaryRestrictions: options.dietaryRestrictions || [],
      cuisinePreferences: options.cuisinePreferences || [],
      allergies: options.allergies || []
    });

    return result;
  } catch (error) {
    console.error('Error creating meal plan:', error);
    throw error;
  }
};


module.exports = {
  generateDailySummary,
  createWorkoutPlan,
  createMealPlan,
};
