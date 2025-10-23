const mongoose = require('mongoose');
const { Exercise, Workout } = require('./models/Workout');
const { Food } = require('./models/Nutrition');

const seedExercises = [
  {
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for upper body strength',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Start in a plank position with hands shoulder-width apart',
      'Lower your body until chest nearly touches the floor',
      'Push back up to starting position',
      'Keep your body straight throughout the movement'
    ],
    tips: ['Keep your core engaged', 'Don\'t let your hips sag'],
    duration: null,
    caloriesPerMinute: 8,
    isCustom: false
  },
  {
    name: 'Squats',
    description: 'Fundamental lower body exercise',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your knees behind your toes',
      'Return to standing position'
    ],
    tips: ['Keep your chest up', 'Engage your core'],
    duration: null,
    caloriesPerMinute: 6,
    isCustom: false
  },
  {
    name: 'Burpees',
    description: 'Full-body high-intensity exercise',
    category: 'cardio',
    muscleGroups: ['full-body'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: [
      'Start in standing position',
      'Drop into a squat and place hands on floor',
      'Jump feet back into plank position',
      'Do a push-up',
      'Jump feet back to squat position',
      'Jump up with arms overhead'
    ],
    tips: ['Maintain good form over speed', 'Land softly'],
    duration: null,
    caloriesPerMinute: 15,
    isCustom: false
  },
  {
    name: 'Plank',
    description: 'Core strengthening exercise',
    category: 'strength',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Start in push-up position',
      'Lower onto your forearms',
      'Keep your body in a straight line',
      'Hold the position'
    ],
    tips: ['Don\'t let your hips sag', 'Breathe normally'],
    duration: 60,
    caloriesPerMinute: 5,
    isCustom: false
  },
  {
    name: 'Mountain Climbers',
    description: 'Cardio exercise targeting core and legs',
    category: 'cardio',
    muscleGroups: ['core', 'legs', 'shoulders'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Start in plank position',
      'Bring right knee to chest',
      'Quickly switch legs',
      'Continue alternating at a steady pace'
    ],
    tips: ['Keep your core tight', 'Maintain plank position'],
    duration: null,
    caloriesPerMinute: 12,
    isCustom: false
  }
];

const seedWorkouts = [
  {
    name: 'Beginner Full Body',
    description: 'A complete full-body workout for beginners',
    category: 'strength',
    difficulty: 'beginner',
    duration: 30,
    exercises: [
      { sets: 3, reps: 10, restTime: 60 },
      { sets: 3, reps: 12, restTime: 60 },
      { sets: 2, reps: 5, restTime: 90 },
      { sets: 3, reps: 30, duration: 30, restTime: 45 }
    ],
    estimatedCalories: 200,
    muscleGroups: ['full-body'],
    equipment: ['none'],
    tags: ['beginner', 'full-body', 'strength'],
    isCustom: false,
    isPublic: true,
    completedCount: 0
  },
  {
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for maximum calorie burn',
    category: 'cardio',
    difficulty: 'intermediate',
    duration: 25,
    exercises: [
      { sets: 4, reps: 15, restTime: 45 },
      { sets: 4, reps: 20, restTime: 30 },
      { sets: 4, reps: 12, restTime: 45 }
    ],
    estimatedCalories: 350,
    muscleGroups: ['full-body'],
    equipment: ['none'],
    tags: ['hiit', 'cardio', 'fat-burning'],
    isCustom: false,
    isPublic: true,
    completedCount: 0
  },
  {
    name: 'Core Strength',
    description: 'Focused workout for core muscles',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 20,
    exercises: [
      { sets: 3, reps: 30, duration: 30, restTime: 45 },
      { sets: 3, reps: 20, restTime: 45 },
      { sets: 3, reps: 15, restTime: 60 }
    ],
    estimatedCalories: 150,
    muscleGroups: ['core'],
    equipment: ['none'],
    tags: ['core', 'abs', 'strength'],
    isCustom: false,
    isPublic: true,
    completedCount: 0
  }
];

const seedFoods = [
  {
    name: 'Banana',
    brand: '',
    servingSize: '1 medium (118g)',
    servingSizeGrams: 118,
    nutrition: {
      calories: 105,
      protein: 1.3,
      carbohydrates: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14.4,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 0.1,
      transFat: 0,
      vitamins: {
        vitaminA: 76,
        vitaminC: 10.3,
        vitaminD: 0,
        vitaminE: 0.1,
        vitaminK: 0.5
      },
      minerals: {
        calcium: 6,
        iron: 0.3,
        magnesium: 32,
        phosphorus: 26,
        potassium: 422
      }
    },
    category: 'fruits',
    allergens: [],
    isCustom: false,
    verified: true
  },
  {
    name: 'Chicken Breast',
    brand: '',
    servingSize: '100g',
    servingSizeGrams: 100,
    nutrition: {
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      cholesterol: 85,
      saturatedFat: 1,
      transFat: 0,
      vitamins: {
        vitaminA: 21,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 0.27,
        vitaminK: 0.3
      },
      minerals: {
        calcium: 15,
        iron: 0.7,
        magnesium: 29,
        phosphorus: 228,
        potassium: 256
      }
    },
    category: 'protein',
    allergens: [],
    isCustom: false,
    verified: true
  },
  {
    name: 'Brown Rice',
    brand: '',
    servingSize: '1 cup cooked (195g)',
    servingSizeGrams: 195,
    nutrition: {
      calories: 216,
      protein: 5,
      carbohydrates: 45,
      fat: 1.8,
      fiber: 3.5,
      sugar: 0.7,
      sodium: 10,
      cholesterol: 0,
      saturatedFat: 0.4,
      transFat: 0,
      vitamins: {
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 0.6,
        vitaminK: 0.6
      },
      minerals: {
        calcium: 20,
        iron: 0.8,
        magnesium: 84,
        phosphorus: 162,
        potassium: 84
      }
    },
    category: 'grains',
    allergens: [],
    isCustom: false,
    verified: true
  },
  {
    name: 'Greek Yogurt',
    brand: 'Chobani',
    servingSize: '1 container (170g)',
    servingSizeGrams: 170,
    nutrition: {
      calories: 100,
      protein: 17,
      carbohydrates: 6,
      fat: 0,
      fiber: 0,
      sugar: 4,
      sodium: 50,
      cholesterol: 5,
      saturatedFat: 0,
      transFat: 0,
      vitamins: {
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0
      },
      minerals: {
        calcium: 170,
        iron: 0,
        magnesium: 17,
        phosphorus: 153,
        potassium: 221
      }
    },
    category: 'dairy',
    allergens: ['milk'],
    isCustom: false,
    verified: true
  },
  {
    name: 'Almonds',
    brand: '',
    servingSize: '1 oz (28g)',
    servingSizeGrams: 28,
    nutrition: {
      calories: 164,
      protein: 6,
      carbohydrates: 6,
      fat: 14,
      fiber: 3.5,
      sugar: 1.2,
      sodium: 1,
      cholesterol: 0,
      saturatedFat: 1.1,
      transFat: 0,
      vitamins: {
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 7.3,
        vitaminK: 0
      },
      minerals: {
        calcium: 76,
        iron: 1.1,
        magnesium: 77,
        phosphorus: 136,
        potassium: 208
      }
    },
    category: 'fats',
    allergens: ['tree-nuts'],
    isCustom: false,
    verified: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Exercise.deleteMany({});
    await Workout.deleteMany({});
    await Food.deleteMany({});

    // Insert exercises
    const exercises = await Exercise.insertMany(seedExercises);
    console.log(`${exercises.length} exercises inserted`);

    // Insert foods
    const foods = await Food.insertMany(seedFoods);
    console.log(`${foods.length} foods inserted`);

    // Update workouts with exercise references
    const workoutData = seedWorkouts.map((workout, index) => ({
      ...workout,
      exercises: workout.exercises.map((exerciseData, exerciseIndex) => ({
        exercise: exercises[exerciseIndex]?._id || exercises[0]._id,
        ...exerciseData
      }))
    }));

    const workouts = await Workout.insertMany(workoutData);
    console.log(`${workouts.length} workouts inserted`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = { seedDatabase, seedExercises, seedWorkouts, seedFoods };

