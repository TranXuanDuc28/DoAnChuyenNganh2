const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WorkoutPlan, WorkoutPlanDay, Exercise, WorkoutPlanDayExercise } = require('../models/Workout');
const User = require('../models/User');
const { Op } = require('sequelize');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const currentWeight = user.currentWeight || user.weight;
    const workoutDuration = user.workout_duration || 60; // Default 60 minutes if not set

    // Determine workout location text
    let locationText = 'Both gym and home';
    if (workoutLocation.atGym && !workoutLocation.atHome) {
      locationText = 'At gym only';
    } else if (!workoutLocation.atGym && workoutLocation.atHome) {
      locationText = 'At home only';
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a professional fitness trainer and workout program designer. Create a personalized ${duration}-week workout plan for this user.

User Profile:
- Gender: ${user.gender}
- Age: ${user.age} years
- Height: ${user.height} cm
- Weight: ${currentWeight} kg
- BMI: ${bmi.toFixed(1)}
- Fitness Level: ${user.fitnessLevel}
- Activity Level: ${user.activityLevel}
- Fitness Goals: ${Array.isArray(user.fitnessGoals) ? user.fitnessGoals.join(', ') : goal}
- Primary Goal: ${goal}
${focusAreas.length > 0 ? `- Focus Areas: ${focusAreas.join(', ')}` : ''}

Plan Requirements:
- Duration: ${duration} weeks
- Frequency: ${frequency} workouts per week
- Total Days: ${duration * 7} days
- Workout Location: ${locationText}
- Maximum Workout Duration per Session: ${workoutDuration} minutes (STRICTLY ENFORCE THIS LIMIT)

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

Instructions:
1. Create a progressive workout plan that matches the user's fitness level
2. Include rest days (mark as isRestDay: true)
3. For each workout day, select 4-8 exercises from the available exercises list above
4. Use ONLY the exercise IDs provided above - these exercises are already filtered for the user's workout location preference
5. Vary the exercises throughout the week to target different muscle groups
6. Include warm-up and cool-down recommendations in notes
7. Provide specific sets, reps, duration, and rest periods for each exercise
8. Make the plan progressive - increase intensity over weeks
9. Consider the workout location (${locationText}) when designing the plan structure
10. Rest time guidelines:
    - For exercises WITH sets (strength training): use 30 seconds rest between sets
    - For exercises WITHOUT sets (cardio, yoga, stretching): use 60 seconds rest between exercises
11. **CRITICAL: Total workout duration per day MUST NOT EXCEED ${workoutDuration} minutes**
    - Calculate total time including: exercise duration + (sets × rest time) + warm-up/cool-down
    - Adjust number of exercises, sets, or reps to fit within ${workoutDuration} minutes
    - The "totalDuration" field for each day MUST be ≤ ${workoutDuration} minutes

Return ONLY valid JSON in this exact format:
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
      "note": "totalDuration MUST be ≤ ${workoutDuration} minutes",
      "exercises": [
        {
          "exerciseId": 123,
          "exerciseName": "Push-ups",
          "sets": 3,
          "reps": 12,
          "duration": null,
          "restSeconds": 30,
          "notes": "Keep core tight"
        }
      ],
      "notes": "Warm up for 5-10 minutes before starting. Focus on form over speed."
    }
  ],
  "weeklyStructure": "Brief description of the weekly pattern",
  "progressionNotes": "How to progress through the weeks",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Important:
- For cardio exercises, use "duration" in minutes instead of "sets" and "reps"
- For strength exercises, use "sets" and "reps"
- Include rest days strategically (typically 2-3 per week)
- Total days array should have ${duration * 7} entries
- Use realistic calorie estimates based on exercise intensity and duration
- **ENFORCE: Each workout day's totalDuration MUST NOT exceed ${workoutDuration} minutes**
- If you cannot fit enough exercises in ${workoutDuration} minutes, reduce sets/reps or number of exercises
`;

    console.log('Generating workout plan with Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

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

    // Create workout plan days and their exercises
    for (const day of aiPlan.days) {
      // Create the day
      const workoutPlanDay = await WorkoutPlanDay.create({
        workoutPlanId: workoutPlan.id,
        dayNumber: day.dayNumber,
        dayName: day.dayName,
        focusArea: day.focusArea,
        exercises: day.exercises, // Keep JSON for backward compatibility
        totalDuration: day.totalDuration,
        estimatedCalories: day.estimatedCalories,
        notes: day.notes,
        isRestDay: day.isRestDay || false,
        isCompleted: false
      });

      // Create exercise associations if not a rest day
      if (!day.isRestDay && day.exercises && day.exercises.length > 0) {
        const exercisePromises = day.exercises.map((exercise, index) => {
          // Determine rest time based on exercise type
          // If exercise has sets (strength training) -> 30 seconds
          // If no sets (cardio, yoga, etc.) -> 60 seconds
          let restTime = 60; // Default for cardio/no-sets exercises
          if (exercise.sets && exercise.sets > 0) {
            restTime = 30; // Strength training with sets
          }

          return WorkoutPlanDayExercise.create({
            workoutPlanDayId: workoutPlanDay.id,
            exerciseId: exercise.exerciseId,
            orderIndex: index,
            sets: exercise.sets || null,
            reps: exercise.reps ? String(exercise.reps) : null,
            duration: exercise.duration || null,
            restSeconds: exercise.restSeconds || restTime,
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
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises',
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name', 'category', 'muscleGroups', 'equipment', 'difficulty', 'description', 'videoUrl', 'imageUrl']
          }]
        }]
      }],
      order: [
        [{ model: WorkoutPlanDay, as: 'days' }, 'dayNumber', 'ASC'],
        [{ model: WorkoutPlanDay, as: 'days' }, { model: WorkoutPlanDayExercise, as: 'dayExercises' }, 'orderIndex', 'ASC']
      ]
    });

    return {
      success: true,
      workoutPlan: completePlan
    };

  } catch (error) {
    console.error('Workout Plan Generation Error:', error.message);

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
    const workoutPlan = await WorkoutPlan.findOne({
      where: {
        userId: userId,
        isActive: true
      },
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises',
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name', 'category', 'muscleGroups', 'equipment', 'difficulty', 'description', 'videoUrl', 'imageUrl']
          }]
        }]
      }],
      order: [
        ['createdAt', 'DESC'],
        [{ model: WorkoutPlanDay, as: 'days' }, 'dayNumber', 'ASC'],
        [{ model: WorkoutPlanDay, as: 'days' }, { model: WorkoutPlanDayExercise, as: 'dayExercises' }, 'orderIndex', 'ASC']
      ]
    });

    if (!workoutPlan) {
      return {
        success: false,
        message: 'No active workout plan found'
      };
    }

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
    const plans = await WorkoutPlan.findAll({
      where: { userId },
      include: [{
        model: WorkoutPlanDay,
        as: 'days',
        attributes: ['id', 'dayNumber', 'isCompleted', 'isRestDay'],
        include: [{
          model: WorkoutPlanDayExercise,
          as: 'dayExercises',
          attributes: ['id', 'exerciseId'],
          include: [{
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name']
          }]
        }]
      }],
      order: [
        ['createdAt', 'DESC'],
        [{ model: WorkoutPlanDay, as: 'days' }, 'dayNumber', 'ASC'],
        [{ model: WorkoutPlanDay, as: 'days' }, { model: WorkoutPlanDayExercise, as: 'dayExercises' }, 'orderIndex', 'ASC']
      ]
    });

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
 * Mark workout day as completed
 * @param {number} dayId - Workout plan day ID
 * @param {number} userId - User ID (for verification)
 * @returns {Promise<Object>} Updated day
 */
const completeWorkoutDay = async (dayId, userId) => {
  try {
    const day = await WorkoutPlanDay.findByPk(dayId, {
      include: [{
        model: WorkoutPlan,
        as: 'workoutPlan',
        where: { userId }
      }]
    });

    if (!day) {
      throw new Error('Workout day not found or does not belong to user');
    }

    day.isCompleted = true;
    day.completedAt = new Date();
    await day.save();

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

module.exports = {
  generateWorkoutPlan,
  getActiveWorkoutPlan,
  getUserWorkoutPlans,
  getWorkoutPlanDayDetails,
  completeWorkoutDay,
  completeExercise,
  deactivateWorkoutPlan,
  getCompletedWorkoutDays
};

