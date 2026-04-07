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
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {User} user - User instance
 * @returns {number} BMR in calories
 */
const calculateBMR = (user) => {
  let bmr;
  if (user.gender === 'male') {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }
  return bmr;
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - User's activity level
 * @returns {number} TDEE in calories
 */
const calculateTDEE = (bmr, activityLevel) => {
  // Activity level multipliers (PAL - Physical Activity Level)
  const activityMultipliers = {
    sedentary: 1.2,          // Little or no exercise
    lightly_active: 1.375,   // Light exercise 1-3 days/week
    moderately_active: 1.55, // Moderate exercise 3-5 days/week
    very_active: 1.725,      // Hard exercise 6-7 days/week
    extra_active: 1.9        // Very hard exercise & physical job
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
  return tdee;
};

/**
 * Calculate recommended daily calories based on user data
 * @param {User} user - User instance
 * @returns {Object} Calorie breakdown with BMR, TDEE, and target
 */
const calculateDailyCalories = (user) => {
  // Step 1: Calculate BMR (calories burned at rest)
  const bmr = calculateBMR(user);

  // Step 2: Calculate TDEE (calories burned with daily activity)
  const tdee = calculateTDEE(bmr, user.activityLevel);

  // Step 3: Adjust based on fitness goals
  const primaryGoal = Array.isArray(user.fitnessGoals) ? user.fitnessGoals[0] : user.fitnessGoals;

  let targetCalories;
  let adjustment = 0;
  let adjustmentReason = '';

  switch (primaryGoal) {
    case 'lose_weight':
      adjustment = -500; // 500 calorie deficit for 0.5kg/week loss
      adjustmentReason = '500 cal deficit for weight loss';
      targetCalories = Math.round(tdee - 500);
      break;
    case 'build_muscle':
      adjustment = +300; // 300 calorie surplus for muscle gain
      adjustmentReason = '300 cal surplus for muscle building';
      targetCalories = Math.round(tdee + 300);
      break;
    case 'gain_weight':
      adjustment = +500; // 500 calorie surplus for weight gain
      adjustmentReason = '500 cal surplus for weight gain';
      targetCalories = Math.round(tdee + 500);
      break;
    default:
      adjustment = 0;
      adjustmentReason = 'Maintenance calories';
      targetCalories = Math.round(tdee); // Maintenance
  }

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    adjustment,
    adjustmentReason
  };
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
    const calorieBreakdown = calculateDailyCalories(user);
    const { bmr, tdee, targetCalories } = calorieBreakdown;
    const bmi = calculateBMI(user.weight, user.height);
    const primaryGoal = Array.isArray(user.fitnessGoals) ? user.fitnessGoals[0] : user.fitnessGoals;
    const macros = getMacroDistribution(primaryGoal, targetCalories);

    console.log('📊 Nutritional calculations:', {
      bmr,
      tdee,
      targetCalories,
      adjustment: calorieBreakdown.adjustment,
      adjustmentReason: calorieBreakdown.adjustmentReason,
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

CALORIE CALCULATION BREAKDOWN:
- BMR (Basal Metabolic Rate): ${bmr} kcal/day
  • Calories burned at rest (breathing, circulation, cell production)
- TDEE (Total Daily Energy Expenditure): ${tdee} kcal/day  
  • BMR × Activity Level (${user.activityLevel})
  • Total calories burned with daily activities
- Target Daily Calories: ${targetCalories} kcal/day
  • TDEE ${calorieBreakdown.adjustment >= 0 ? '+' : ''}${calorieBreakdown.adjustment} kcal (${calorieBreakdown.adjustmentReason})

DAILY NUTRITIONAL TARGETS (CONSISTENT FOR ALL DAYS):
- Daily Calories: EXACTLY ${targetCalories} kcal (±50 kcal tolerance)
- Protein: ${macros.protein.grams}g (${macros.protein.percentage}%)
- Carbohydrates: ${macros.carbs.grams}g (${macros.carbs.percentage}%)
- Fat: ${macros.fat.grams}g (${macros.fat.percentage}%)

MEAL PLAN REQUIREMENTS:
- Duration: ${duration} days
- Meals per day: ${mealsPerDay} (Breakfast, Lunch, Dinner, Snack)
${dietaryRestrictions.length > 0 ? `- Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${cuisinePreferences.length > 0 ? `- Cuisine Preferences: ${cuisinePreferences.join(', ')}` : ''}
${allergies.length > 0 ? `- Allergies: ${allergies.join(', ')}` : ''}

CRITICAL INSTRUCTIONS:
1. **CONSISTENCY REQUIREMENT**: Each day MUST have EXACTLY ${targetCalories} kcal (±50 kcal maximum variance)
   - Day 1: ${targetCalories} kcal
   - Day 2: ${targetCalories} kcal
   - Day 3: ${targetCalories} kcal
   - ... (all ${duration} days should be the same)
   
2. Create a ${duration}-day meal plan with ${mealsPerDay} meals per day

3. Daily macro targets (CONSISTENT across all days):
   - Protein: ${macros.protein.grams}g ± 5g
   - Carbs: ${macros.carbs.grams}g ± 10g
   - Fat: ${macros.fat.grams}g ± 5g

4. Each meal should be:
   - Realistic and easy to prepare
   - Culturally appropriate (Vietnamese + International)
   - Properly portioned to meet calorie targets
   
5. Include detailed nutritional information for EACH food item

6. Vary the food choices but MAINTAIN consistent daily totals

7. Consider the user's fitness goal (${primaryGoal}) when selecting food types

8. Include preparation instructions for each meal

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
        "calories": ${targetCalories},
        "protein": ${macros.protein.grams},
        "carbs": ${macros.carbs.grams},
        "fat": ${macros.fat.grams}
      }
    }
    // ... repeat for all ${duration} days
  ],
  "weeklyTotals": {
    "avgDailyCalories": ${targetCalories},
    "avgProtein": ${macros.protein.grams},
    "avgCarbs": ${macros.carbs.grams},
    "avgFat": ${macros.fat.grams}
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

CRITICAL VALIDATION RULES:
- **MOST IMPORTANT**: Every single day MUST have exactly ${targetCalories} kcal (±50 kcal max)
- All days should have nearly identical macro totals (protein: ${macros.protein.grams}g, carbs: ${macros.carbs.grams}g, fat: ${macros.fat.grams}g)
- The "avgDailyCalories" in weeklyTotals should equal ${targetCalories} (NOT an average, but the target)
- Return ONLY valid JSON, no markdown code blocks or additional text
- Make sure all numbers are actual numbers, not strings
- Ensure meals are practical and achievable
- Consider meal prep and time constraints
- Include variety to prevent boredom while maintaining consistent calorie targets
- Respect any dietary restrictions or allergies

EXAMPLE OF CORRECT CALORIE DISTRIBUTION:
Day 1: Breakfast 400 + Lunch 600 + Dinner 700 + Snack 300 = ${targetCalories} kcal ✓
Day 2: Breakfast 420 + Lunch 580 + Dinner 720 + Snack 280 = ${targetCalories} kcal ✓
Day 3: Breakfast 380 + Lunch 620 + Dinner 680 + Snack 320 = ${targetCalories} kcal ✓
(Notice: different meals but SAME daily total)
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
      totalCalories: targetCalories,
      macronutrients: macros,
      dietaryRestrictions,
      preferences: {
        cuisine: cuisinePreferences,
        allergies,
        mealsPerDay,
        bmr,
        tdee,
        targetCalories,
        calorieAdjustment: calorieBreakdown.adjustment,
        adjustmentReason: calorieBreakdown.adjustmentReason
      },
      isActive: true,
      aiGenerated: true,
      aiPrompt: `Goal: ${primaryGoal}, BMR: ${bmr}, TDEE: ${tdee}, Target: ${targetCalories} (${calorieBreakdown.adjustmentReason}), Duration: ${duration} days, BMI: ${bmi.value} (${bmi.level})`
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
        calorieBreakdown: {
          bmr,
          tdee,
          targetCalories,
          adjustment: calorieBreakdown.adjustment,
          adjustmentReason: calorieBreakdown.adjustmentReason
        },
        dailyCalories: targetCalories,
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
    const { Op } = require('sequelize');

    // First, deactivate expired meal plans
    const now = new Date();
    await MealPlan.update(
      { isActive: false },
      {
        where: {
          userId,
          isActive: true,
          endDate: {
            [Op.lt]: now // endDate is less than current time
          }
        }
      }
    );

    // Then fetch only active meal plans
    const mealPlans = await MealPlan.findAll({
      where: {
        userId,
        isActive: true
      },
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
  calculateBMR,
  calculateTDEE,
  calculateBMI,
  getMacroDistribution
};

