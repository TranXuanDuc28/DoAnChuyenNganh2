const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate detailed meal plan from diet recommendation
 * @param {Object} params - Parameters for meal plan generation
 * @returns {Promise<Object>} Detailed meal plan
 */
const generateMealPlan = async ({ dietRecommendation, userInfo, bmi, level }) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
You are a professional nutritionist. Based on the following information, create a detailed 1-day meal plan with 4 meals (Breakfast, Lunch, Dinner, and 1 Snack).

User Information:
- Sex: ${userInfo.sex}
- Age: ${userInfo.age} years
- Height: ${userInfo.height} cm
- Weight: ${userInfo.weight} kg
- BMI: ${bmi}
- Level: ${level}
- Fitness Goal: ${userInfo.fitnessGoal}
- Fitness Type: ${userInfo.fitnessType}
- Hypertension: ${userInfo.hypertension}
- Diabetes: ${userInfo.diabetes}

Diet Recommendation from ML Model:
${dietRecommendation}

Please create a detailed meal plan in JSON format with the following structure:
{
  "breakfast": {
    "name": "Meal name",
    "time": "Suggested time (e.g., 7:00 AM)",
    "description": "Brief description",
    "foods": [
      {
        "name": "Food item name",
        "amount": "Amount (e.g., 100g, 1 cup)",
        "calories": estimated calories (number)
      }
    ],
    "totalCalories": total calories (number),
    "macros": {
      "protein": grams (number),
      "carbs": grams (number),
      "fat": grams (number)
    },
    "instructions": ["Step 1", "Step 2", ...]
  },
  "lunch": { ... same structure ... },
  "dinner": { ... same structure ... },
  "snack": { ... same structure ... },
  "totalDailyCalories": total calories for the day (number),
  "totalDailyMacros": {
    "protein": grams (number),
    "carbs": grams (number),
    "fat": grams (number)
  },
  "notes": ["Important note 1", "Important note 2", ...],
  "hydration": "Water intake recommendation"
}

Important:
1. Make sure the meals align with the diet recommendation provided
2. Consider the user's health conditions (hypertension, diabetes)
3. Adjust calories based on their fitness goal
4. Provide realistic and achievable meal suggestions
5. Include Vietnamese food options when appropriate
6. Return ONLY valid JSON, no additional text or markdown
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    const mealPlan = JSON.parse(text);

    return {
      success: true,
      mealPlan
    };
  } catch (error) {
    console.error('Gemini Service Error:', error.message);
    
    if (error.message.includes('API key')) {
      throw new Error('Gemini API key is not configured properly');
    }
    
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse meal plan from AI response');
    }
    
    throw new Error(`Failed to generate meal plan: ${error.message}`);
  }
};

/**
 * Generate nutritional advice based on user data
 * @param {Object} params - User information
 * @returns {Promise<Object>} Nutritional advice
 */
const generateNutritionAdvice = async ({ userInfo, bmi, level, dietRecommendation }) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
As a professional nutritionist, provide personalized nutrition advice for this user:

User Profile:
- Sex: ${userInfo.sex}
- Age: ${userInfo.age} years
- Height: ${userInfo.height} cm
- Weight: ${userInfo.weight} kg
- BMI: ${bmi} (${level})
- Fitness Goal: ${userInfo.fitnessGoal}
- Health Conditions: Hypertension: ${userInfo.hypertension}, Diabetes: ${userInfo.diabetes}

Diet Recommendation: ${dietRecommendation}

Provide advice in JSON format:
{
  "dailyCalorieTarget": number,
  "macroTargets": {
    "protein": { "grams": number, "percentage": number },
    "carbs": { "grams": number, "percentage": number },
    "fat": { "grams": number, "percentage": number }
  },
  "tips": ["tip 1", "tip 2", "tip 3", ...],
  "foodsToEat": ["food 1", "food 2", ...],
  "foodsToAvoid": ["food 1", "food 2", ...],
  "mealTiming": {
    "breakfast": "time range",
    "lunch": "time range",
    "dinner": "time range",
    "snacks": "time range"
  }
}

Return ONLY valid JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const advice = JSON.parse(text);

    return {
      success: true,
      advice
    };
  } catch (error) {
    console.error('Gemini Advice Error:', error.message);
    throw new Error(`Failed to generate nutrition advice: ${error.message}`);
  }
};

/**
 * Chat with AI fitness assistant
 * @param {string} message - User message
 * @returns {Promise<Object>} AI response
 */
const chatWithAssistant = async (message) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a professional fitness and health AI assistant. You ONLY answer questions related to:
- Fitness and exercise
- Workout routines and training
- Nutrition and diet
- Health and wellness
- Weight management
- Muscle building
- Cardio training
- Yoga and stretching
- Sports performance
- Recovery and rest
- Supplements (basic info only)

If the user asks about anything NOT related to fitness, health, or wellness, politely decline and redirect them back to fitness topics.

User question: ${message}

Provide a helpful, concise, and accurate answer. Keep it under 200 words. Use emojis when appropriate.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text
    };
  } catch (error) {
    console.error('Gemini Chat Error:', error.message);
    throw new Error(`Failed to chat with AI: ${error.message}`);
  }
};

module.exports = {
  generateMealPlan,
  generateNutritionAdvice,
  chatWithAssistant
};

