const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WorkoutPlan, WorkoutPlanDay, Exercise, WorkoutPlanDayExercise } = require('../models/Workout');
const User = require('../models/User');
const { Op } = require('sequelize');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * MET Values (Metabolic Equivalent of Task) for different exercise types
 * Source: Compendium of Physical Activities
 */
const MET_VALUES = {
  // Strength Training
  strength_light: 3.5,      // Light effort (e.g., light weights)
  strength_moderate: 5.0,   // Moderate effort (e.g., general weight lifting)
  strength_vigorous: 6.0,   // Vigorous effort (e.g., heavy weights)

  // Cardio
  cardio_light: 4.0,        // Walking, light cycling
  cardio_moderate: 6.5,     // Jogging, moderate cycling
  cardio_vigorous: 9.0,     // Running, intense cycling
  cardio_intense: 12.0,     // HIIT, sprinting

  // Specific exercises
  pushups: 8.0,
  pullups: 8.0,
  squats: 5.5,
  lunges: 4.0,
  plank: 4.0,
  burpees: 10.0,
  jumping_jacks: 8.0,
  mountain_climbers: 8.0,

  // Yoga & Stretching
  yoga_gentle: 2.5,
  yoga_power: 4.0,
  stretching: 2.3,

  // Default
  default: 5.0
};

/**
 * Calculate calories burned for an exercise
 * Formula: Calories = (MET × Weight in kg × Duration in hours)
 * 
 * @param {Object} exercise - Exercise details
 * @param {number} userWeight - User's weight in kg
 * @returns {number} Estimated calories burned
 */
const calculateExerciseCalories = (exercise, userWeight) => {
  const { category, sets, reps, duration, restSeconds } = exercise;

  // Get MET value based on category
  let met = MET_VALUES.default;

  if (category) {
    const categoryLower = category.toLowerCase();

    // Map categories to MET values
    if (categoryLower.includes('cardio') || categoryLower.includes('hiit')) {
      met = MET_VALUES.cardio_vigorous;
    } else if (categoryLower.includes('strength') || categoryLower.includes('weight')) {
      met = MET_VALUES.strength_moderate;
    } else if (categoryLower.includes('yoga')) {
      met = MET_VALUES.yoga_power;
    } else if (categoryLower.includes('stretch')) {
      met = MET_VALUES.stretching;
    } else if (categoryLower.includes('chest') || categoryLower.includes('back') ||
      categoryLower.includes('legs') || categoryLower.includes('arms') ||
      categoryLower.includes('shoulders') || categoryLower.includes('core')) {
      met = MET_VALUES.strength_moderate;
    }
  }

  // Calculate duration in hours
  let durationHours = 0;

  if (duration) {
    // Cardio exercises with duration in minutes
    durationHours = duration / 60;
  } else if (sets && reps) {
    // Strength exercises: estimate time based on sets, reps, and rest
    // Assume 3 seconds per rep + rest time between sets
    const repsNum = parseInt(reps) || 10;
    const totalExerciseTime = (sets * repsNum * 3); // seconds
    const totalRestTime = (sets - 1) * (restSeconds || 30); // seconds
    const totalTimeSeconds = totalExerciseTime + totalRestTime;
    durationHours = totalTimeSeconds / 3600; // convert to hours
  } else {
    // Default: assume 5 minutes
    durationHours = 5 / 60;
  }

  // Calculate calories: MET × weight (kg) × time (hours)
  const calories = met * userWeight * durationHours;

  return Math.round(calories);
};

/**
 * Generate AI-powered workout plan based on user profile
 * @param {number} userId - User ID
 * @param {Object} preferences - User preferences for workout plan
 * @returns {Promise<Object>} Generated workout plan
 */
const generateWorkoutPlan = async (userId, preferences = {}) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get user data
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare workout preferences first (MUST BE BEFORE using workoutLocation)
    const {
      duration = 4, // weeks
      frequency = 4, // workouts per week
      goal = user.fitnessGoals?.[0] || 'general_fitness',
      focusAreas = [],
      workoutLocation = { atGym: true, atHome: true }
    } = preferences;

    // Build equipment filter based on workout location
    let equipmentFilter = {};

    if (workoutLocation.atGym && !workoutLocation.atHome) {
      // Gym only - exercises that require gym equipment
      equipmentFilter = {
        equipment: {
          [Op.or]: [
            { [Op.like]: '%barbell%' },
            { [Op.like]: '%dumbbell%' },
            { [Op.like]: '%machine%' },
            { [Op.like]: '%cable%' },
            { [Op.like]: '%bench%' },
            { [Op.like]: '%rack%' }
          ]
        }
      };
    } else if (!workoutLocation.atGym && workoutLocation.atHome) {
      // Home only - bodyweight or minimal equipment
      equipmentFilter = {
        [Op.or]: [
          { equipment: { [Op.is]: null } },
          { equipment: { [Op.eq]: '[]' } },
          { equipment: { [Op.like]: '%bodyweight%' } },
          { equipment: { [Op.like]: '%mat%' } },
          { equipment: { [Op.like]: '%resistance band%' } }
        ]
      };
    }
    // If both are true, no equipment filter (all exercises)

    // Get available exercises from database
    const exercises = await Exercise.findAll({
      where: {
        difficulty: {
          [Op.in]: [user.fitnessLevel, 'beginner'] // Include beginner exercises for all levels
        },
        ...equipmentFilter
      },
      attributes: ['id', 'name', 'category', 'muscleGroups', 'equipment', 'difficulty', 'description'],
      limit: 100 // Limit to avoid too much data
    });

    // Calculate BMI and fitness metrics
    const bmi = user.calculateBMI();
    const heightInMeters = user.height / 100;
    const workoutDuration = user.workoutDuration || 60; // Default 60 minutes if not set
    const userWeight = user.weight; // User's weight for calorie calculations

    // Determine workout location text
    let locationText = 'Both gym and home';
    if (workoutLocation.atGym && !workoutLocation.atHome) {
      locationText = 'At gym only';
    } else if (!workoutLocation.atGym && workoutLocation.atHome) {
      locationText = 'At home only';
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
You are a professional fitness trainer and workout program designer. Create a personalized ${duration}-week workout plan for this user.

USER PROFILE:
- Gender: ${user.gender}
- Age: ${user.age} years
- Height: ${user.height} cm
- Current Weight: ${userWeight} kg (CRITICAL for calorie calculations)
${user.targetWeight ? `- Target Weight: ${user.targetWeight} kg` : ''}
- BMI: ${bmi.toFixed(1)}
- Fitness Level: ${user.fitnessLevel}
- Activity Level: ${user.activityLevel}
- Fitness Goals: ${Array.isArray(user.fitnessGoals) ? user.fitnessGoals.join(', ') : goal}
- Primary Goal: ${goal}
${focusAreas.length > 0 ? `- Focus Areas: ${focusAreas.join(', ')}` : ''}

PLAN REQUIREMENTS:
- Duration: ${duration} weeks
- Frequency: ${frequency} workouts per week
- Total Days: ${duration * 7} days
- Workout Location: ${locationText}
- Maximum Workout Duration per Session: ${workoutDuration} minutes (STRICTLY ENFORCE THIS LIMIT)

CALORIE CALCULATION FORMULA (Use this for ALL exercises):
Formula: Calories = MET × Weight(kg) × Duration(hours)

MET Values (Metabolic Equivalent of Task):
- Strength Training (Light): 3.5 MET
- Strength Training (Moderate): 5.0 MET
- Strength Training (Vigorous): 6.0 MET
- Cardio (Light - Walking): 4.0 MET
- Cardio (Moderate - Jogging): 6.5 MET
- Cardio (Vigorous - Running): 9.0 MET
- HIIT/Intense Cardio: 12.0 MET
- Push-ups/Pull-ups: 8.0 MET
- Squats: 5.5 MET
- Burpees: 10.0 MET
- Yoga (Power): 4.0 MET
- Stretching: 2.3 MET

Example Calculation for User (${userWeight}kg):
1. Push-ups: 3 sets × 12 reps = 36 reps × 3 sec/rep = 108 sec = 0.03 hours
   Calories = 8.0 MET × ${userWeight} kg × 0.03 hours = ${Math.round(8.0 * userWeight * 0.03)} kcal

2. Running 20 minutes: 20 min = 0.33 hours
   Calories = 9.0 MET × ${userWeight} kg × 0.33 hours = ${Math.round(9.0 * userWeight * 0.33)} kcal

3. Squats: 4 sets × 15 reps = 60 reps × 3 sec/rep = 180 sec = 0.05 hours  
   Calories = 5.5 MET × ${userWeight} kg × 0.05 hours = ${Math.round(5.5 * userWeight * 0.05)} kcal

Available Exercises (use ONLY these exercise IDs):
${exercises.map(ex => {
      // Handle muscleGroups - it might be a string, array, or null
      let muscles = 'N/A';
      if (ex.muscleGroups) {
        if (Array.isArray(ex.muscleGroups)) {
          muscles = ex.muscleGroups.join(', ');
        } else if (typeof ex.muscleGroups === 'string') {
          try {
            const parsed = JSON.parse(ex.muscleGroups);
            muscles = Array.isArray(parsed) ? parsed.join(', ') : ex.muscleGroups;
          } catch {
            muscles = ex.muscleGroups;
          }
        }
      }
      return `- ID: ${ex.id}, Name: "${ex.name}", Category: ${ex.category}, Muscles: ${muscles}, Difficulty: ${ex.difficulty}`;
    }).join('\n')}

CRITICAL INSTRUCTIONS:

1. CALORIE CALCULATION (MOST IMPORTANT):
   - Use the MET formula above for EVERY exercise
   - Calculate ACCURATE calories based on user weight (${userWeight} kg)
   - Sum up all exercise calories to get "estimatedCalories" for each day
   - BE PRECISE with calorie calculations

2. Create a progressive workout plan that matches the user's fitness level

3. Include rest days (mark as isRestDay: true)

4. For each workout day, select 4-8 exercises from the available exercises list above

5. Use ONLY the exercise IDs provided above - these exercises are already filtered for the user's workout location preference

6. Vary the exercises throughout the week to target different muscle groups

7. Provide specific sets, reps, duration, and rest periods for each exercise

8. Make the plan progressive - increase intensity over weeks

9. Consider the workout location (${locationText}) when designing the plan structure

10. Rest time guidelines:
    - For exercises WITH sets (strength training): use 30 seconds rest between sets
    - For exercises WITHOUT sets (cardio, yoga, stretching): use 60 seconds rest between exercises

11. DURATION CONSTRAINT:
    - Total workout duration per day MUST NOT EXCEED ${workoutDuration} minutes
    - Calculate total time including: exercise duration + (sets × rest time) + warm-up/cool-down
    - Adjust number of exercises, sets, or reps to fit within ${workoutDuration} minutes
    - The "totalDuration" field for each day MUST be ≤ ${workoutDuration} minutes

12. CALORIE VALIDATION:
    - Verify each exercise's calories using the MET formula
    - Total calories per workout should be realistic (typically 200-600 kcal for ${workoutDuration} min)
    - Higher intensity = more calories (HIIT > Strength > Yoga)

Return ONLY valid JSON in this exact format (Create only the FIRST WEEK - 7 DAYS):
{
  "planName": "Descriptive plan name",
  "planDescription": "Brief description of the plan",
  "totalWeeks": ${duration},
  "workoutsPerWeek": ${frequency},
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Day 1 - Upper Body Strength",
      "focusArea": "Upper Body",
      "isRestDay": false,
      "totalDuration": 45,
      "estimatedCalories": 300,
      "exercises": [
        {
          "exerciseId": 123,
          "exerciseName": "Push-ups",
          "sets": 3,
          "reps": "12",
          "duration": null,
          "restSeconds": 30,
          "estimatedCalories": 60,
          "notes": "Keep core tight"
        }
      ],
      "notes": "Warm up for 5-10 minutes"
    }
    // ... repeat for DAYS 1 to 7 ONLY
  ],
  "weeklyStructure": "Description of the weekly pattern",
  "progressionNotes": "How to increase intensity each week",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

VALIDATION CHECKLIST:
✓ Create exactly 7 days for the first week cycle
✓ For cardio, use "duration" (min). For strength, use "sets" and "reps"
✓ Include rest days strategically (2-3 per week)
✓ **CALORIE ACCURACY**: Use MET formula: Calories = MET × ${userWeight}kg × Duration(hrs)
✓ **DURATION LIMIT**: Each day's totalDuration MUST NOT exceed ${workoutDuration} minutes
✓ Calories should be realistic: 200-600 kcal per session

EXAMPLE OF CORRECT DAY STRUCTURE:
{
  "dayNumber": 1,
  "dayName": "Day 1 - Upper Body Strength",
  "focusArea": "Upper Body",
  "isRestDay": false,
  "totalDuration": 45,
  "estimatedCalories": 320,
  "exercises": [
    {
      "exerciseId": 1,
      "exerciseName": "Push-ups",
      "sets": 3,
      "reps": "15",
      "estimatedCalories": 60,
      "restSeconds": 30
    }
  ]
}

IMPORTANT: Provide exactly 7 days. The system will automatically replicate this for weeks 2 to ${duration} based on your progression notes.
`;

    console.log(`Generating workout plan with Gemini AI (Model: ${modelName})...`);
    
    // Helper to call Gemini with retry logic for transient errors
    const generateWithRetry = async (retries = 3, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const result = await model.generateContent(prompt);
          return await result.response;
        } catch (error) {
          const isServiceUnavailable = error.message?.includes('503') || error.status === 503 || error.message?.includes('Service Unavailable');
          
          if (isServiceUnavailable && i < retries - 1) {
            console.log(`⚠️ Gemini Service Unavailable (503). Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; 
            continue;
          }
          throw error;
        }
      }
    };

    const response = await generateWithRetry();
    let text = response.text();

    // Enhanced cleanup: Extract only the JSON part using regex
    // This handles cases where Gemini adds conversational text before/after the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    // Parse JSON
    const aiPlan = JSON.parse(text);

    // Validate that all exercise IDs exist
    const exerciseIds = new Set(exercises.map(e => e.id));
    const invalidExercises = [];

    aiPlan.days.forEach(day => {
      if (day.exercises) {
        day.exercises.forEach(ex => {
          if (!exerciseIds.has(ex.exerciseId)) {
            invalidExercises.push(ex.exerciseId);
          }
        });
      }
    });

    if (invalidExercises.length > 0) {
      console.warn('AI used invalid exercise IDs:', invalidExercises);
      // Filter out invalid exercises
      aiPlan.days.forEach(day => {
        if (day.exercises) {
          day.exercises = day.exercises.filter(ex => exerciseIds.has(ex.exerciseId));
        }
      });
    }

    // Create workout plan in database
    const workoutPlan = await WorkoutPlan.create({
      userId: userId,
      name: aiPlan.planName,
      description: aiPlan.planDescription,
      goal: goal,
      duration: duration,
      frequency: frequency,
      difficulty: user.fitnessLevel,
      schedule: {
        weeklyStructure: aiPlan.weeklyStructure,
        progressionNotes: aiPlan.progressionNotes,
        tips: aiPlan.tips,
        workoutLocation: locationText
      },
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000),
      progress: {
        completedWorkouts: 0,
        totalWorkouts: aiPlan.days.filter(d => !d.isRestDay).length,
        averageRating: 0
      },
      aiGenerated: true,
      aiPrompt: `Goal: ${goal}, Duration: ${duration} weeks, Frequency: ${frequency}/week, Location: ${locationText}`
    });

    // Create workout plan days and their exercises (Week 1 Only)
    for (const day of aiPlan.days) {
      const workoutPlanDay = await WorkoutPlanDay.create({
        workoutPlanId: workoutPlan.id,
        dayNumber: day.dayNumber,
        dayName: day.dayName,
        focusArea: day.focusArea,
        exercises: day.exercises,
        totalDuration: day.totalDuration,
        estimatedCalories: day.estimatedCalories,
        notes: day.notes,
        isRestDay: day.isRestDay || false,
        isCompleted: false
      });

      if (!day.isRestDay && day.exercises && day.exercises.length > 0) {
        const exercisePromises = day.exercises.map((exercise, index) => {
          return WorkoutPlanDayExercise.create({
            workoutPlanDayId: workoutPlanDay.id,
            exerciseId: exercise.exerciseId,
            orderIndex: index,
            sets: exercise.sets || null,
            reps: exercise.reps ? String(exercise.reps) : null,
            duration: exercise.duration || null,
            restSeconds: exercise.restSeconds || 30,
            weight: exercise.weight || null,
            notes: exercise.notes || null
          });
        });
        await Promise.all(exercisePromises);
      }
    }

    // Fetch complete plan with days and exercises
    const completePlan = await WorkoutPlan.findByPk(workoutPlan.id, {
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        separate: true,
        order: [['dayNumber', 'ASC']],
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises',
          separate: true,
          order: [['orderIndex', 'ASC']],
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name', 'category', 'muscleGroups', 'equipment', 'difficulty', 'description', 'videoUrl', 'imageUrl']
          }]
        }]
      }]
    });

    return {
      success: true,
      workoutPlan: completePlan
    };

  } catch (error) {
    console.error('Workout Plan Generation Error:', error);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => `${err.path}: ${err.message}`);
      throw new Error(`Validation Error: ${messages.join(', ')}`);
    }

    if (error.message.includes('API key')) {
      throw new Error('Gemini API key is not configured properly');
    }

    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse workout plan from AI response');
    }

    throw new Error(`Failed to generate workout plan: ${error.message}`);
  }
};

/**
 * Get user's active workout plan with progress
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Active workout plan
 */
const getActiveWorkoutPlan = async (userId) => {
  try {
    const plans = await WorkoutPlan.findAll({
      where: {
        userId: userId,
        isActive: true
      },
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        separate: true, 
        order: [['dayNumber', 'ASC']],
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises',
          separate: true, 
          order: [['orderIndex', 'ASC']],
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name', 'category', 'muscleGroups', 'equipment', 'difficulty', 'description', 'videoUrl', 'imageUrl']
          }]
        }]
      }]
    });

    if (!plans || plans.length === 0) {
      return {
        success: false,
        message: 'No active workout plan found'
      };
    }

    // Sort in Node.js instead of MySQL to avoid "Out of sort memory"
    const workoutPlan = plans.sort((a, b) => b.createdAt - a.createdAt)[0];

    // Calculate progress
    const totalDays = workoutPlan.days.length;
    const completedDays = workoutPlan.days.filter(d => d.isCompleted).length;
    const progressPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    // Find current day (first incomplete day)
    const currentDay = workoutPlan.days.find(d => !d.isCompleted);

    return {
      success: true,
      workoutPlan: {
        ...workoutPlan.toJSON(),
        progressPercentage,
        completedDays,
        totalDays,
        currentDay: currentDay || null
      }
    };

  } catch (error) {
    console.error('Get Workout Plan Error:', error.message);
    throw new Error(`Failed to get workout plan: ${error.message}`);
  }
};

/**
 * Get all workout plans for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of workout plans
 */
const getUserWorkoutPlans = async (userId) => {
  try {
    let plans = await WorkoutPlan.findAll({
      where: { userId },
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        separate: true,
        attributes: ['id', 'dayNumber', 'isCompleted', 'isRestDay'],
        order: [['dayNumber', 'ASC']],
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises',
          separate: true,
          attributes: ['id', 'exerciseId'],
          order: [['orderIndex', 'ASC']],
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name']
          }]
        }]
      }]
    });

    // Sort in Node.js
    plans = plans.sort((a, b) => b.createdAt - a.createdAt);

    // Calculate progress for each plan
    const plansWithProgress = plans.map(plan => {
      const totalDays = plan.days.length;
      const completedDays = plan.days.filter(d => d.isCompleted).length;
      const progressPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

      return {
        ...plan.toJSON(),
        progressPercentage,
        completedDays,
        totalDays
      };
    });

    return {
      success: true,
      plans: plansWithProgress
    };

  } catch (error) {
    console.error('Get User Workout Plans Error:', error.message);
    throw new Error(`Failed to get workout plans: ${error.message}`);
  }
};

/**
 * Get workout plan day details with exercise information
 * @param {number} dayId - Workout plan day ID
 * @returns {Promise<Object>} Day details with exercises
 */
const getWorkoutPlanDayDetails = async (dayId) => {
  try {
    const day = await WorkoutPlanDay.findByPk(dayId, {
      include: [{
        model: WorkoutPlanDayExercise,
        as: 'dayExercises',
        include: [{
          model: Exercise,
          as: 'exercise'
        }],
        order: [['orderIndex', 'ASC']]
      }]
    });

    if (!day) {
      throw new Error('Workout day not found');
    }

    // Transform dayExercises to match the expected format
    const exercisesWithDetails = day.dayExercises ? day.dayExercises.map(de => ({
      id_dayExercise: de.id, // ID from workout_plan_day_exercises table - needed for completion tracking
      exerciseId: de.exerciseId,
      exerciseName: de.exercise ? de.exercise.name : 'Unknown Exercise', // Add exerciseName field
      sets: de.sets,
      reps: de.reps,
      duration: de.duration,
      restSeconds: de.restSeconds,
      weight: de.weight,
      notes: de.notes,
      isCompleted: de.isCompleted, // Add completion status
      completedAt: de.completedAt, // Add completion timestamp
      exerciseDetails: de.exercise ? {
        id: de.exercise.id,
        name: de.exercise.name,
        description: de.exercise.description,
        category: de.exercise.category,
        muscleGroups: de.exercise.muscleGroups,
        equipment: de.exercise.equipment,
        difficulty: de.exercise.difficulty,
        instructions: de.exercise.instructions,
        tips: de.exercise.tips,
        videoUrl: de.exercise.videoUrl,
        imageUrl: de.exercise.imageUrl
      } : null
    })) : [];

    return {
      success: true,
      day: {
        ...day.toJSON(),
        exercises: exercisesWithDetails
      }
    };

  } catch (error) {
    console.error('Get Workout Day Details Error:', error.message);
    throw new Error(`Failed to get workout day details: ${error.message}`);
  }
};

/**
 * Mark a workout day as completed
 * @param {number} dayId - Workout plan day ID
 * @param {number} userId - User ID
 * @param {Object} feedbackData - Feedback data (difficultyFeedback, userNotes)
 * @returns {Promise<Object>} Update result
 */
const completeWorkoutDay = async (dayId, userId, feedbackData = {}) => {
  try {
    const day = await WorkoutPlanDay.findOne({
      where: { id: dayId },
      include: [{ model: WorkoutPlan, as: 'workoutPlan', where: { userId } }]
    });

    if (!day) throw new Error('Workout day not found or not owned by user');

    const { difficultyFeedback, userNotes } = feedbackData;

    await day.update({
      isCompleted: true,
      completedAt: new Date(),
      difficultyFeedback: difficultyFeedback || null,
      userNotes: userNotes || null
    });

    // Update workout plan progress
    const plan = day.workoutPlan;
    const allDays = await WorkoutPlanDay.findAll({
      where: { workoutPlanId: plan.id }
    });

    const completedWorkouts = allDays.filter(d => d.isCompleted && !d.isRestDay).length;
    const totalWorkouts = allDays.filter(d => !d.isRestDay).length;

    plan.progress = {
      ...plan.progress,
      completedWorkouts,
      totalWorkouts
    };
    await plan.save();

    return {
      success: true,
      day: day.toJSON(),
      planProgress: {
        completedWorkouts,
        totalWorkouts,
        percentage: Math.round((completedWorkouts / totalWorkouts) * 100)
      }
    };

  } catch (error) {
    console.error('Complete Workout Day Error:', error.message);
    throw new Error(`Failed to complete workout day: ${error.message}`);
  }
};

/**
 * Deactivate workout plan
 * @param {number} planId - Workout plan ID
 * @param {number} userId - User ID (for verification)
 * @returns {Promise<Object>} Result
 */
const deactivateWorkoutPlan = async (planId, userId) => {
  try {
    const plan = await WorkoutPlan.findOne({
      where: {
        id: planId,
        userId: userId
      }
    });

    if (!plan) {
      throw new Error('Workout plan not found');
    }

    plan.isActive = false;
    await plan.save();

    return {
      success: true,
      message: 'Workout plan deactivated'
    };

  } catch (error) {
    console.error('Deactivate Workout Plan Error:', error.message);
    throw new Error(`Failed to deactivate workout plan: ${error.message}`);
  }
};

/**
 * Mark individual exercise as completed
 * @param {number} exerciseId - Workout plan day exercise ID
 * @param {number} userId - User ID (for verification)
 * @returns {Promise<Object>} Updated exercise
 */
const completeExercise = async (exerciseId, userId) => {
  try {
    const dayExercise = await WorkoutPlanDayExercise.findByPk(exerciseId, {
      include: [{
        model: WorkoutPlanDay,
        as: 'workoutPlanDay',
        include: [{
          model: WorkoutPlan,
          as: 'workoutPlan',
          where: { userId }
        }]
      }]
    });

    if (!dayExercise) {
      throw new Error('Exercise not found or does not belong to user');
    }

    dayExercise.isCompleted = true;
    dayExercise.completedAt = new Date();
    await dayExercise.save();

    return {
      success: true,
      exercise: dayExercise.toJSON()
    };

  } catch (error) {
    console.error('Complete Exercise Error:', error.message);
    throw new Error(`Failed to complete exercise: ${error.message}`);
  }
};

/**
 * Get completed workout exercises for user history
 * @param {number} userId - User ID
 * @returns {Promise<Object>} List of completed exercises
 */
const getCompletedWorkoutDays = async (userId) => {
  try {
    const completedExercises = await WorkoutPlanDayExercise.findAll({
      where: {
        isCompleted: true
      },
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['name', 'category', 'muscleGroups']
        },
        {
          model: WorkoutPlanDay,
          as: 'workoutPlanDay',
          attributes: ['dayName', 'dayNumber', 'focusArea'],
          include: [{
            model: WorkoutPlan,
            as: 'workoutPlan',
            where: { userId },
            attributes: ['name']
          }]
        }
      ],
      order: [['completedAt', 'DESC']],
      limit: 50
    });

    // Transform for frontend display
    const history = completedExercises.map(ex => {
      const exercise = ex.exercise;
      const day = ex.workoutPlanDay;
      const plan = day?.workoutPlan;

      // Calculate estimated duration for this exercise
      let estimatedDuration = 0;
      if (ex.sets && ex.reps) {
        // Strength: assume 3 seconds per rep + rest time
        const repsNum = parseInt(ex.reps) || 10;
        estimatedDuration = Math.ceil((ex.sets * repsNum * 3 + ex.sets * (ex.restSeconds || 30)) / 60);
      } else if (ex.duration) {
        estimatedDuration = ex.duration;
      }

      return {
        id: ex.id,
        name: exercise?.name || 'Unknown Exercise',
        planName: plan?.name,
        dayName: day?.dayName || `Day ${day?.dayNumber}`,
        focusArea: day?.focusArea,
        date: ex.completedAt,
        duration: estimatedDuration > 0 ? `${estimatedDuration} min` : 'N/A',
        calories: estimatedDuration * 5, // Rough estimate: 5 cal/min
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight
      };
    });

    return {
      success: true,
      history
    };

  } catch (error) {
    console.error('Get Workout History Error:', error.message);
    throw new Error(`Failed to get workout history: ${error.message}`);
  }
};

/**
 * Get today's calories burned and exercise completion data
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Today's calorie data with body metrics
 */
const getTodayCalories = async (userId) => {
  try {
    // Get user data with body metrics
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get today's date range (start of day to end of day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get completed exercises for today
    const completedExercises = await WorkoutPlanDayExercise.findAll({
      where: {
        isCompleted: true,
        completedAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['name', 'category']
        },
        {
          model: WorkoutPlanDay,
          as: 'workoutPlanDay',
          include: [{
            model: WorkoutPlan,
            as: 'workoutPlan',
            where: { userId },
            attributes: ['id']
          }]
        }
      ]
    });

    // Calculate total calories burned today
    let totalCalories = 0;
    const userWeight = user.weight || 70; // Default weight if not set

    completedExercises.forEach(ex => {
      const calories = calculateExerciseCalories({
        category: ex.exercise?.category,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        restSeconds: ex.restSeconds
      }, userWeight);

      totalCalories += calories;
    });

    // Calculate target calories based on user's active workout plan
    let targetCalories = 0;
    const activePlan = await WorkoutPlan.findOne({
      where: {
        userId: userId,
        isActive: true
      },
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        where: {
          isRestDay: false
        },
        required: false
      }]
    });

    if (activePlan && activePlan.days && activePlan.days.length > 0) {
      // Calculate average calories per workout day
      const totalEstimatedCalories = activePlan.days.reduce((sum, day) => {
        return sum + (day.estimatedCalories || 0);
      }, 0);
      targetCalories = Math.round(totalEstimatedCalories / activePlan.days.length);
    } else {
      // Default target based on fitness goal
      targetCalories = 300; // Default target
    }

    // Calculate percentage
    const percentage = targetCalories > 0
      ? Math.min(Math.round((totalCalories / targetCalories) * 100), 100)
      : 0;

    // Prepare body metrics
    const bodyMetrics = {
      weight: user.weight,
      height: user.height,
      bmi: user.calculateBMI(),
      waistCircumference: user.waistCircumference,
      hipCircumference: user.hipCircumference,
      whr: user.calculateWHR(),
      gender: user.gender,
      targetWeight: user.targetWeight
    };

    return {
      caloriesBurned: Math.round(totalCalories),
      targetCalories,
      completedExercisesCount: completedExercises.length,
      percentage,
      bodyMetrics
    };

  } catch (error) {
    console.error('Get Today Calories Error:', error.message);
    throw new Error(`Failed to get today calories: ${error.message}`);
  }
};

/**
 * Adapt a workout plan for the next week based on performance
 * @param {number} userId - User ID
 * @param {number} planId - Current workout plan ID
 * @returns {Promise<Object>} Updated plan with next week days
 */
const adaptPlanForNextWeek = async (userId, planId) => {
  try {
    const plan = await WorkoutPlan.findOne({
      where: { id: planId, userId },
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        separate: true,
        order: [['dayNumber', 'ASC']],
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises'
        }]
      }]
    });

    if (!plan) throw new Error('Workout plan not found');

    const totalWeeks = plan.duration;
    const currentDaysCount = plan.days.length;
    const currentWeek = Math.floor(currentDaysCount / 7) + 1;

    if (currentWeek >= totalWeeks) {
      return { success: false, message: 'Plan already completed for all weeks' };
    }

    // 1. Analyze last week's performance and feedback
    const lastWeekDays = plan.days.slice(-7);
    const completedCount = lastWeekDays.filter(d => d.isCompleted).length;
    const completionRate = (completedCount / 7) * 100;
    
    // Aggregate feedback
    const feedbackSummary = lastWeekDays
      .filter(d => d.isCompleted && d.difficultyFeedback)
      .map(d => `Day ${d.dayNumber}: ${d.difficultyFeedback}${d.userNotes ? ` (${d.userNotes})` : ''}`)
      .join('\n');

    // 2. Prepare context for AI
    const performanceSummary = `
      User just finished Week ${currentWeek - 1}.
      Completion Rate: ${completionRate}% (${completedCount}/7 days completed).
      
      User Feedback on Difficulty:
      ${feedbackSummary || 'No specific feedback provided.'}

      Current Goal: ${plan.goal}.
      Last week structure: ${lastWeekDays.map(d => d.focusArea).join(', ')}.
    `;

    // 3. Call Gemini to generate NEXT week
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
      You are an adaptive AI Fitness Coach. Based on the user's performance in Week ${currentWeek - 1}, generate Week ${currentWeek} of their ${totalWeeks}-week plan.
      
      User Performance Summary:
      ${performanceSummary}

      Guidelines:
      - If completion rate > 80%: Increase intensity (more reps, sets, or shorter rest).
      - If completion rate < 50%: Keep intensity same or slightly decrease to improve consistency.
      - Maintain the same frequency: ${plan.frequency} days/week.
      
      Return ONLY valid JSON for the NEXT 7 DAYS (Days ${currentDaysCount + 1} to ${currentDaysCount + 7}) in the same format as the initial plan.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    const nextWeekPlan = JSON.parse(text);

    // 4. Save next week days to DB
    for (const day of nextWeekPlan.days) {
      const newDay = await WorkoutPlanDay.create({
        workoutPlanId: plan.id,
        dayNumber: day.dayNumber,
        dayName: `Week ${currentWeek} - ${day.dayName}`,
        focusArea: day.focusArea,
        exercises: day.exercises,
        totalDuration: day.totalDuration,
        estimatedCalories: day.estimatedCalories,
        notes: day.notes,
        isRestDay: day.isRestDay || false,
        isCompleted: false
      });

      if (!day.isRestDay && day.exercises) {
        for (const [index, ex] of day.exercises.entries()) {
          await WorkoutPlanDayExercise.create({
            workoutPlanDayId: newDay.id,
            exerciseId: ex.exerciseId,
            orderIndex: index,
            sets: ex.sets || null,
            reps: ex.reps ? String(ex.reps) : null,
            duration: ex.duration || null,
            restSeconds: ex.restSeconds || 30,
            weight: ex.weight || null,
            notes: ex.notes || null
          });
        }
      }
    }

    return { success: true, message: `Week ${currentWeek} generated successfully` };

  } catch (error) {
    console.error('Adapt Plan Error:', error);
    throw error;
  }
};

module.exports = {
  generateWorkoutPlan,
  getActiveWorkoutPlan,
  getUserWorkoutPlans,
  getWorkoutPlanDayDetails,
  completeWorkoutDay,
  completeExercise,
  deactivateWorkoutPlan,
  getCompletedWorkoutDays,
  getTodayCalories,
  calculateExerciseCalories,
  adaptPlanForNextWeek, // New function
  MET_VALUES
};

