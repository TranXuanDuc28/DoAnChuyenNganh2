const express = require('express');
const { Workout, WorkoutSession, Exercise, ExerciseCategory } = require('../models/Workout');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  createUploadMiddleware,
  extractPublicId 
} = require('../utils/cloudinary');
const router = express.Router();

// Create multer upload middleware
const upload = createUploadMiddleware({ maxSize: 10 * 1024 * 1024 }); // 10MB for workout images

// Get workout plans
router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    
    const where = { isPublic: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const workouts = await Workout.findAll({
      where,
      include: [{ model: Exercise, through: { attributes: [] } }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exercise categories for client - count via exercise_category_mappings
router.get('/exercise-categories', auth, async (req, res) => {
  try {
    const categories = await ExerciseCategory.findAll({
      where: { isActive: true },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM exercise_category_mappings AS ecm
              WHERE ecm.category_id = ExerciseCategory.id
            )`),
            'exerciseCount'
          ]
        ]
      },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });

    const serialized = categories.map(category => {
      const json = category.toJSON();
      
      // Debug log để kiểm tra data
      console.log(`Category: ${json.name}, imageUrl: ${json.imageUrl}, imageKey: ${json.imageKey}, exerciseCount: ${category.get('exerciseCount')}`);
      
      return {
        ...json,
        exerciseCount: Number(category.get('exerciseCount')) || 0
      };
    });

    res.json(serialized);
  } catch (error) {
    console.error('Get exercise categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exercises - filter by exercise_category_mappings table
router.get('/exercises', auth, async (req, res) => {
  try {
    const { category, muscleGroup, difficulty, limit = 20, categoryId } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (muscleGroup) where.muscleGroups = { [Op.contains]: [muscleGroup] };
    if (difficulty) where.difficulty = difficulty;

    // Build include for filtering by exercise category via exercise_category_mappings
    const include = [];
    if (categoryId) {
      // Filter exercises that belong to this category (via mapping table)
      include.push({
        model: ExerciseCategory,
        as: 'categories',
        where: { id: categoryId },
        through: { attributes: [] }, // Don't include junction table data
        required: true // INNER JOIN - only get exercises that have this category
      });
    } else {
      // Include all categories for each exercise
      include.push({
        model: ExerciseCategory,
        as: 'categories',
        through: { attributes: [] },
        required: false // LEFT JOIN - include exercises even if they have no categories
      });
    }

    const exercises = await Exercise.findAll({
      where,
      include,
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id, {
      include: [
        { model: Exercise, through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create workout
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      createdBy: req.user.id,
      isCustom: true
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      const folder = `fitness-app/workouts`;
      const result = await uploadToCloudinary(req.file.buffer, folder);
      workoutData.imageUrl = result.url;
      workoutData.imageKey = result.publicId;
    }

    const workout = await Workout.create(workoutData);
    
    if (req.body.exercises && Array.isArray(req.body.exercises)) {
      await workout.setExercises(req.body.exercises.map(e => e.id));
    }

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start workout session
router.post('/:id/start', auth, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const sessionData = {
      userId: req.user.id,
      workoutId: req.params.id,
      startTime: new Date(),
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: Array(ex.sets || 1).fill({
          reps: ex.reps || 0,
          weight: ex.weight || 0,
          duration: ex.duration || 0,
          distance: ex.distance || 0,
          completed: false
        })
      }))
    };

    const session = await WorkoutSession.create(sessionData);

    res.status(201).json({
      message: 'Workout session started',
      session
    });
  } catch (error) {
    console.error('Start workout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout session
router.put('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    await session.update(req.body);

    res.json({
      message: 'Workout session updated',
      session
    });
  } catch (error) {
    console.error('Update workout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete workout session
router.post('/sessions/:id/complete', auth, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60));

    await session.update({
      endTime,
      duration,
      isCompleted: true,
      rating: req.body.rating,
      mood: req.body.mood,
      difficulty: req.body.difficulty,
      notes: req.body.notes
    });

    // Update workout completed count
    await Workout.increment('completedCount', {
      where: { id: session.workoutId }
    });

    res.json({
      message: 'Workout session completed',
      session
    });
  } catch (error) {
    console.error('Complete workout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const sessions = await WorkoutSession.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Workout,
        attributes: ['name', 'category', 'duration']
      }],
      order: [['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create exercise
router.post('/exercises', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 }
]), async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      createdBy: req.user.id,
      isCustom: true
    };

    // Upload image to Cloudinary if provided
    if (req.files && req.files.image && req.files.image[0]) {
      const folder = `fitness-app/exercises/images`;
      const result = await uploadToCloudinary(req.files.image[0].buffer, folder);
      exerciseData.imageUrl = result.url;
      exerciseData.imageKey = result.publicId;
    }

    // Upload video to Cloudinary if provided
    if (req.files && req.files.videoUrl && req.files.videoUrl[0]) {
      const folder = `fitness-app/exercises/videos`;
      const result = await uploadToCloudinary(req.files.videoUrl[0].buffer, folder, {
        resource_type: 'video'
      });
      exerciseData.videoUrl = result.url;
      exerciseData.videoKey = result.publicId;
    }

    const exercise = await Exercise.create(exerciseData);

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload exercise image
router.post('/exercises/:id/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Delete old image from Cloudinary if exists
    if (exercise.imageKey) {
      await deleteFromCloudinary(exercise.imageKey);
    } else if (exercise.imageUrl) {
      const oldPublicId = extractPublicId(exercise.imageUrl);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Upload new image to Cloudinary
    const folder = `fitness-app/exercises/images`;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // Update exercise image
    await exercise.update({ 
      imageUrl: result.url,
      imageKey: result.publicId
    });

    res.json({
      message: 'Exercise image uploaded successfully',
      imageUrl: result.url
    });
  } catch (error) {
    console.error('Upload exercise image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload exercise video
router.post('/exercises/:id/video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Delete old video from Cloudinary if exists
    if (exercise.videoKey) {
      await deleteFromCloudinary(exercise.videoKey, { resource_type: 'video' });
    } else if (exercise.videoUrl) {
      const oldPublicId = extractPublicId(exercise.videoUrl);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId, { resource_type: 'video' });
      }
    }

    // Upload new video to Cloudinary
    const folder = `fitness-app/exercises/videos`;
    const result = await uploadToCloudinary(req.file.buffer, folder, {
      resource_type: 'video'
    });

    // Update exercise video
    await exercise.update({ 
      videoUrl: result.url,
      videoKey: result.publicId
    });

    res.json({
      message: 'Exercise video uploaded successfully',
      videoUrl: result.url
    });
  } catch (error) {
    console.error('Upload exercise video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete exercise image
router.delete('/exercises/:id/image', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Delete image from Cloudinary if exists
    if (exercise.imageKey) {
      await deleteFromCloudinary(exercise.imageKey);
    } else if (exercise.imageUrl) {
      const publicId = extractPublicId(exercise.imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Remove image URL from exercise
    await exercise.update({ 
      imageUrl: null,
      imageKey: null
    });

    res.json({ message: 'Exercise image deleted successfully' });
  } catch (error) {
    console.error('Delete exercise image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete exercise video
router.delete('/exercises/:id/video', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Delete video from Cloudinary if exists
    if (exercise.videoKey) {
      await deleteFromCloudinary(exercise.videoKey, { resource_type: 'video' });
    } else if (exercise.videoUrl) {
      const publicId = extractPublicId(exercise.videoUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId, { resource_type: 'video' });
      }
    }

    // Remove video URL from exercise
    await exercise.update({ 
      videoUrl: null,
      videoKey: null
    });

    res.json({ message: 'Exercise video deleted successfully' });
  } catch (error) {
    console.error('Delete exercise video error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
