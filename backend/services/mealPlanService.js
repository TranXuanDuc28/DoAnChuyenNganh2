/**
 * Meal Plan Service - LLM-based meal plan generation
 * Similar to workout plan service, uses Gemini AI directly with user data
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const { MealPlan } = require('../models/Nutrition');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Calculate recommended daily calories based on user data
 * @param {User} user - User instance
 * @returns {number} Recommended daily calories
 */
const calculateDailyCalories = (user) => {
  // Use Mifflin-St Jeor Equation
  let bmr;
  if (user.gender === 'male') {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };

  const tdee = bmr * (activityMultipliers[user.activityLevel] || 1.55);

  // Adjust based on fitness goals
  const primaryGoal = Array.isArray(user.fitnessGoals) ? user.fitnessGoals[0] : user.fitnessGoals;

  switch (primaryGoal) {
    case 'lose_weight':
      return Math.round(tdee - 500); // 500 calorie deficit
    case 'build_muscle':
      return Math.round(tdee + 300); // 300 calorie surplus
    case 'gain_weight':
      return Math.round(tdee + 500); // 500 calorie surplus
    default:
      return Math.round(tdee); // Maintenance
  }
};

/**
 * Calculate BMI and get BMI level
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {Object} BMI value and level
 */
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let level;
  if (bmi < 18.5) level = 'Underweight';
  else if (bmi < 25) level = 'Normal';
  else if (bmi < 30) level = 'Overweight';
  else level = 'Obese';

  return {
    value: parseFloat(bmi.toFixed(1)),
    level
  };
};

/**
 * Get macro distribution based on fitness goal
 * @param {string} goal - Fitness goal
 * @param {number} calories - Daily calories
 * @returns {Object} Macro distribution
 */
const getMacroDistribution = (goal, calories) => {
  let proteinPercent, carbsPercent, fatPercent;

  switch (goal) {
    case 'lose_weight':
      proteinPercent = 30;
      carbsPercent = 40;
      fatPercent = 30;
      break;
    case 'build_muscle':
      proteinPercent = 30;
      carbsPercent = 45;
      fatPercent = 25;
      break;
    case 'gain_weight':
      proteinPercent = 25;
      carbsPercent = 50;
      fatPercent = 25;
      break;
    default: // general_fitness
      proteinPercent = 25;
      carbsPercent = 45;
      fatPercent = 30;
  }

  return {
    protein: {
      percentage: proteinPercent,
      grams: Math.round((calories * proteinPercent / 100) / 4) // 4 cal per gram
    },
    carbs: {
      percentage: carbsPercent,
      grams: Math.round((calories * carbsPercent / 100) / 4) // 4 cal per gram
    },
    fat: {
      percentage: fatPercent,
      grams: Math.round((calories * fatPercent / 100) / 9) // 9 cal per gram
    }
  };
};

/**
 * Generate meal plan using Gemini AI
 * @param {number} userId - User ID
 * @param {Object} options - Meal plan options
 * @returns {Promise<Object>} Generated meal plan
 */
const generateMealPlan = async (userId, options = {}) => {
  try {
    console.log('🍽️ Starting meal plan generation for user:', userId);

    // Step 1: Fetch user data
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log('✅ User data fetched:', {
      name: `${user.firstName} ${user.lastName}`,
      age: user.age,
      gender: user.gender,
      fitnessGoals: user.fitnessGoals
    });

    // Step 2: Calculate nutritional requirements
    const dailyCalories = calculateDailyCalories(user);
    const bmi = calculateBMI(user.weight, user.height);
    const primaryGoal = Array.isArray(user.fitnessGoals) ? user.fitnessGoals[0] : user.fitnessGoals;
    const macros = getMacroDistribution(primaryGoal, dailyCalories);

    console.log('📊 Nutritional calculations:', {
      dailyCalories,
      bmi: bmi.value,
      level: bmi.level,
      macros
    });

    // Step 3: Prepare options
    const {
      duration = 7, // days
      mealsPerDay = 4, // breakfast, lunch, dinner, snack
      dietaryRestrictions = [],
      cuisinePreferences = [],
      allergies = []
    } = options;

    // Step 4: Deactivate old meal plans
    await MealPlan.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    // Step 5: Build AI prompt
    const prompt = `
You are a professional nutritionist and meal planning expert. Create a detailed ${duration}-day meal plan for this user.

USER PROFILE:
- Name: ${user.firstName} ${user.lastName}
- Age: ${user.age} years old
- Gender: ${user.gender}
- Height: ${user.height} cm
- Weight: ${user.weight} kg
- BMI: ${bmi.value} (${bmi.level})
- Activity Level: ${user.activityLevel}
- Fitness Goals: ${Array.isArray(user.fitnessGoals) ? user.fitnessGoals.join(', ') : user.fitnessGoals}

NUTRITIONAL TARGETS (DAILY):
- Calories: ${dailyCalories} kcal
- Protein: ${macros.protein.grams}g (${macros.protein.percentage}%)
- Carbohydrates: ${macros.carbs.grams}g (${macros.carbs.percentage}%)
- Fat: ${macros.fat.grams}g (${macros.fat.percentage}%)

MEAL PLAN REQUIREMENTS:
- Duration: ${duration} days
- Meals per day: ${mealsPerDay} (Breakfast, Lunch, Dinner, Snack)
${dietaryRestrictions.length > 0 ? `- Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${cuisinePreferences.length > 0 ? `- Cuisine Preferences: ${cuisinePreferences.join(', ')}` : ''}
${allergies.length > 0 ? `- Allergies: ${allergies.join(', ')}` : ''}

INSTRUCTIONS:
1. Create a ${duration}-day meal plan with ${mealsPerDay} meals per day
2. Each meal should be realistic, easy to prepare, and culturally appropriate
3. Include both international and Vietnamese food options
4. Provide detailed nutritional information for each meal
5. Ensure daily totals match the target calories and macros (±10% is acceptable)
6. Include preparation instructions for each meal
7. Consider the user's fitness goals when planning meals
8. Make meals varied and interesting throughout the week

OUTPUT FORMAT (JSON):
{
  "planName": "Descriptive plan name",
  "description": "Brief description of the plan",
  "days": [
    {
      "dayNumber": 1,
      "date": "relative date (e.g., Day 1)",
      "meals": {
        "breakfast": {
          "name": "Meal name",
          "time": "Suggested time (e.g., 7:00 AM)",
          "description": "Brief description",
          "foods": [
            {
              "name": "Food item",
              "amount": "Amount with unit (e.g., 100g, 1 cup, 2 eggs)",
              "calories": number
            }
          ],
          "totalCalories": number,
          "macros": {
            "protein": number,
            "carbs": number,
            "fat": number
          },
          "instructions": ["Step 1", "Step 2", ...]
        },
        "lunch": { ... same structure ... },
        "dinner": { ... same structure ... },
        "snack": { ... same structure ... }
      },
      "dailyTotals": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }
    // ... repeat for all ${duration} days
  ],
  "weeklyTotals": {
    "avgDailyCalories": number,
    "avgProtein": number,
    "avgCarbs": number,
    "avgFat": number
  },
  "shoppingList": [
    {
      "category": "Proteins/Vegetables/Grains/etc",
      "items": ["item 1", "item 2", ...]
    }
  ],
  "tips": [
    "Meal prep tip 1",
    "Nutrition tip 2",
    "Hydration reminder",
    ...
  ],
  "hydration": "Daily water intake recommendation (e.g., 2-3 liters)"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks or additional text
- Make sure all numbers are actual numbers, not strings
- Ensure meals are practical and achievable
- Consider meal prep and time constraints
- Include variety to prevent boredom
- Respect any dietary restrictions or allergies
`;

    console.log('🤖 Calling Gemini AI...');

    // Step 6: Call Gemini AI
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Configure Gemini model with timeout settings
    // Set timeout to 3 minutes (180 seconds) to allow sufficient time for plan generation
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    console.log('⏱️ Timeout set to 3 minutes for AI generation');

    // Wrap Gemini API call with timeout (3 minutes = 180 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout after 3 minutes')), 180000);
    });

    const generationPromise = model.generateContent(prompt);

    // Race between generation and timeout
    const result = await Promise.race([generationPromise, timeoutPromise]);
    const response = await result.response;
    let text = response.text();

    console.log('✅ Gemini AI response received successfully');

    // Step 7: Parse AI response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiMealPlan = JSON.parse(text);

    console.log('✅ AI response parsed successfully');

    // Step 8: Save meal plan to database
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const savedMealPlan = await MealPlan.create({
      userId,
      name: aiMealPlan.planName || `${duration}-Day Personalized Meal Plan`,
      description: aiMealPlan.description || `AI-generated meal plan tailored to your goals and preferences`,
      duration,
      startDate,
      endDate,
      meals: aiMealPlan.days,
      totalCalories: dailyCalories,
      macronutrients: macros,
      dietaryRestrictions,
      preferences: {
        cuisine: cuisinePreferences,
        allergies,
        mealsPerDay
      },
      isActive: true,
      aiGenerated: true,
      aiPrompt: `Goal: ${primaryGoal}, Calories: ${dailyCalories}, Duration: ${duration} days, BMI: ${bmi.value} (${bmi.level})`
    });

    console.log('✅ Meal plan saved to database:', savedMealPlan.id);

    return {
      success: true,
      mealPlan: {
        id: savedMealPlan.id,
        name: savedMealPlan.name,
        description: savedMealPlan.description,
        duration: savedMealPlan.duration,
        startDate: savedMealPlan.startDate,
        endDate: savedMealPlan.endDate,
        dailyCalories,
        macros,
        bmi,
        days: aiMealPlan.days,
        shoppingList: aiMealPlan.shoppingList,
        tips: aiMealPlan.tips,
        hydration: aiMealPlan.hydration,
        weeklyTotals: aiMealPlan.weeklyTotals
      }
    };

  } catch (error) {
    console.error('❌ Error generating meal plan:', error);

    if (error.message.includes('API key')) {
      throw new Error('Gemini API key is not configured properly');
    }

    if (error instanceof SyntaxError) {
      console.error('Failed to parse AI response as JSON');
      throw new Error('Failed to parse meal plan from AI response. Please try again.');
    }

    throw error;
  }
};

/**
 * Get active meal plan for user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Active meal plan
 */
const getActiveMealPlan = async (userId) => {
  try {
    const mealPlan = await MealPlan.findOne({
      where: {
        userId,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    if (!mealPlan) {
      return {
        success: false,
        message: 'No active meal plan found'
      };
    }

    return {
      success: true,
      mealPlan
    };
  } catch (error) {
    console.error('Error fetching active meal plan:', error);
    throw error;
  }
};

/**
 * Get all meal plans for user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} All meal plans
 */
const getAllMealPlans = async (userId) => {
  try {
    const mealPlans = await MealPlan.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      mealPlans
    };
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    throw error;
  }
};

/**
 * Deactivate meal plan
 * @param {number} userId - User ID
 * @param {number} mealPlanId - Meal plan ID
 * @returns {Promise<Object>} Result
 */
const deactivateMealPlan = async (userId, mealPlanId) => {
  try {
    const mealPlan = await MealPlan.findOne({
      where: {
        id: mealPlanId,
        userId
      }
    });

    if (!mealPlan) {
      return {
        success: false,
        message: 'Meal plan not found'
      };
    }

    await mealPlan.update({ isActive: false });

    return {
      success: true,
      message: 'Meal plan deactivated successfully'
    };
  } catch (error) {
    console.error('Error deactivating meal plan:', error);
    throw error;
  }
};

module.exports = {
  generateMealPlan,
  getActiveMealPlan,
  getAllMealPlans,
  deactivateMealPlan,
  calculateDailyCalories,
  calculateBMI,
  getMacroDistribution
};

