const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { Exercise, Workout, WorkoutPlan, ExerciseCategory } = require('../models/Workout');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId
} = require('../utils/cloudinary');
const googleSheetsService = require('../services/googleSheets');

// Associations helper
if (!WorkoutPlan.associations || !WorkoutPlan.associations.user) {
  WorkoutPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return fallback;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const uploadCategoryImage = async (file, categoryName = '') => {
  if (!file || !file.buffer) return null;

  const folderSlug = slugify(categoryName) || 'category';
  const folder = `fitness-app/categories/${folderSlug}`;

  const result = await uploadToCloudinary(file.buffer, folder);

  return {
    imageUrl: result.url,
    imageKey: result.publicId
  };
};

const uploadExerciseImage = async (file, exerciseName = '') => {
  if (!file || !file.buffer) return null;

  const folderSlug = slugify(exerciseName) || 'exercise';
  const folder = `fitness-app/exercises/${folderSlug}`;

  const result = await uploadToCloudinary(file.buffer, folder);

  return {
    imageUrl: result.url,
    imageKey: result.publicId
  };
};

const uploadExerciseVideo = async (file, exerciseName = '') => {
  if (!file || !file.buffer) return null;

  const folderSlug = slugify(exerciseName) || 'exercise';
  const folder = `fitness-app/exercises/${folderSlug}`;

  const result = await uploadToCloudinary(file.buffer, folder, { resource_type: 'video' });

  return {
    videoUrl: result.url,
    videoKey: result.publicId
  };
};

// ==================== USER MANAGEMENT ====================

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', isActive = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    if (isActive !== '') where.isActive = isActive === 'true';

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'user', ...otherData } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      ...otherData
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === parseInt(req.params.id) && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

    const { password, email, ...updateData } = req.body;
    await user.update(updateData);

    if (password) {
      user.password = password;
      await user.save();
    }

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Toggle user active error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== CONTENT MANAGEMENT - EXERCISE CATEGORIES ====================

exports.getExerciseCategories = async (req, res) => {
  try {
    const { search = '', isActive = '' } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { englishName: { [Op.like]: `%${search}%` } }
      ];
    }
    if (isActive !== '') {
      where.isActive = isActive === 'true';
    }

    const categories = await ExerciseCategory.findAll({
      where,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM exercises AS e
              WHERE e.exercise_category_id = ExerciseCategory.id
            )`),
            'exerciseCount'
          ]
        ]
      },
      order: [['id', 'ASC']]
    });

    const serialized = categories.map(cat => {
      const json = cat.toJSON();
      return {
        id: json.id,
        name: json.name,
        english_name: json.englishName,
        slug: json.slug,
        description: json.description,
        image_url: json.imageUrl,
        image_key: json.imageKey,
        icon: json.icon,
        background_color: json.backgroundColor,
        display_order: json.displayOrder,
        is_active: json.isActive,
        exercise_count: Number(json.exerciseCount) || 0,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt
      };
    });

    res.json(serialized);
  } catch (error) {
    console.error('Get exercise categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExerciseCategoryById = async (req, res) => {
  try {
    const category = await ExerciseCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Exercise category not found' });
    }

    const json = category.toJSON();
    const serialized = {
      id: json.id,
      name: json.name,
      english_name: json.englishName,
      slug: json.slug,
      description: json.description,
      image_url: json.imageUrl,
      image_key: json.imageKey,
      icon: json.icon,
      background_color: json.backgroundColor,
      display_order: json.displayOrder,
      is_active: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };

    res.json(serialized);
  } catch (error) {
    console.error('Get exercise category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExerciseCategory = async (req, res) => {
  try {
    const {
      slug: rawSlug,
      name,
      english_name,
      description,
      image_url,
      image_key,
      icon,
      background_color,
      display_order,
      is_active
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }

    const finalSlug = slugify(rawSlug || english_name || name);

    if (!finalSlug) {
      return res.status(400).json({ message: 'Could not generate valid slug from provided data' });
    }

    const existing = await ExerciseCategory.findOne({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(400).json({ message: 'Slug already exists. Please choose another name or provide a custom slug.' });
    }

    const payload = {
      name: name.trim(),
      englishName: english_name && english_name.trim() ? english_name.trim() : null,
      slug: finalSlug,
      description: description && description.trim() ? description.trim() : null,
      imageUrl: image_url && image_url.trim() ? image_url.trim() : null,
      imageKey: image_key && image_key.trim() ? image_key.trim() : null,
      icon: icon && icon.trim() ? icon.trim() : null,
      backgroundColor: background_color && background_color.trim() ? background_color.trim() : null,
      displayOrder: toNumber(display_order, 0),
      isActive: is_active !== undefined ? toBoolean(is_active, true) : true
    };

    if (req.file) {
      const uploaded = await uploadCategoryImage(req.file, english_name || name || finalSlug);
      if (uploaded) {
        payload.imageUrl = uploaded.imageUrl;
        payload.imageKey = uploaded.imageKey;
      }
    }

    const category = await ExerciseCategory.create(payload);

    const json = category.toJSON();
    const serialized = {
      id: json.id,
      name: json.name,
      english_name: json.englishName,
      slug: json.slug,
      description: json.description,
      image_url: json.imageUrl,
      image_key: json.imageKey,
      icon: json.icon,
      background_color: json.backgroundColor,
      display_order: json.displayOrder,
      is_active: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };

    res.status(201).json({
      message: 'Exercise category created successfully',
      category: serialized
    });
  } catch (error) {
    console.error('Create exercise category error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateExerciseCategory = async (req, res) => {
  try {
    const category = await ExerciseCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Exercise category not found' });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      const trimmedName = req.body.name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updates.name = trimmedName;
    }

    const englishNameValue = req.body.english_name !== undefined ? req.body.english_name : req.body.englishName;
    if (englishNameValue !== undefined) {
      updates.englishName = englishNameValue && englishNameValue.trim()
        ? englishNameValue.trim()
        : null;
    }

    if (req.body.slug !== undefined || req.body.name !== undefined || englishNameValue !== undefined) {
      const newSlug = slugify(
        req.body.slug ||
        englishNameValue ||
        req.body.name ||
        category.englishName ||
        category.name
      );

      if (!newSlug) {
        return res.status(400).json({ message: 'Could not generate valid slug' });
      }

      if (newSlug !== category.slug) {
        const existing = await ExerciseCategory.findOne({
          where: {
            slug: newSlug,
            id: { [Op.ne]: category.id }
          }
        });
        if (existing) {
          return res.status(400).json({ message: 'Slug already in use by another category' });
        }
        updates.slug = newSlug;
      }
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description && req.body.description.trim()
        ? req.body.description.trim()
        : null;
    }

    const imageUrlValue = req.body.image_url !== undefined ? req.body.image_url : req.body.imageUrl;
    if (imageUrlValue !== undefined) {
      updates.imageUrl = imageUrlValue && imageUrlValue.trim()
        ? imageUrlValue.trim()
        : null;
    }

    const imageKeyValue = req.body.image_key !== undefined ? req.body.image_key : req.body.imageKey;
    if (imageKeyValue !== undefined) {
      updates.imageKey = imageKeyValue && imageKeyValue.trim()
        ? imageKeyValue.trim()
        : null;
    }

    if (req.body.icon !== undefined) {
      updates.icon = req.body.icon && req.body.icon.trim()
        ? req.body.icon.trim()
        : null;
    }

    const backgroundColorValue = req.body.background_color !== undefined ? req.body.background_color : req.body.backgroundColor;
    if (backgroundColorValue !== undefined) {
      updates.backgroundColor = backgroundColorValue && backgroundColorValue.trim()
        ? backgroundColorValue.trim()
        : null;
    }

    const displayOrderValue = req.body.display_order !== undefined ? req.body.display_order : req.body.displayOrder;
    if (displayOrderValue !== undefined) {
      updates.displayOrder = toNumber(displayOrderValue, category.displayOrder);
    }

    const isActiveValue = req.body.is_active !== undefined ? req.body.is_active : req.body.isActive;
    if (isActiveValue !== undefined) {
      updates.isActive = toBoolean(isActiveValue, category.isActive);
    }

    if (req.file) {
      if (category.imageKey) {
        await deleteFromCloudinary(category.imageKey);
      }

      const folderSource =
        updates.englishName ||
        englishNameValue ||
        updates.name ||
        req.body.name ||
        category.englishName ||
        category.name ||
        category.slug;

      const uploaded = await uploadCategoryImage(req.file, folderSource);
      if (uploaded) {
        updates.imageUrl = uploaded.imageUrl;
        updates.imageKey = uploaded.imageKey;
      }
    }

    await category.update(updates);

    const json = category.toJSON();
    const serialized = {
      id: json.id,
      name: json.name,
      english_name: json.englishName,
      slug: json.slug,
      description: json.description,
      image_url: json.imageUrl,
      image_key: json.imageKey,
      icon: json.icon,
      background_color: json.backgroundColor,
      display_order: json.displayOrder,
      is_active: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt
    };

    res.json({
      message: 'Exercise category updated successfully',
      category: serialized
    });
  } catch (error) {
    console.error('Update exercise category error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteExerciseCategory = async (req, res) => {
  try {
    const category = await ExerciseCategory.findByPk(req.params.id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        attributes: ['id']
      }]
    });

    if (!category) {
      return res.status(404).json({ message: 'Exercise category not found' });
    }

    if (category.exercises && category.exercises.length > 0) {
      return res.status(400).json({
        message: `Cannot delete category with ${category.exercises.length} linked exercises. Reassign them first.`
      });
    }

    if (category.imageKey) {
      await deleteFromCloudinary(category.imageKey);
    }

    await category.destroy();

    res.json({ message: 'Exercise category deleted successfully' });
  } catch (error) {
    console.error('Delete exercise category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== CONTENT MANAGEMENT - EXERCISES ====================

exports.getExercises = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', difficulty = '', categoryId = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const include = [{
      model: ExerciseCategory,
      as: 'categories',
      attributes: ['id', 'name', 'englishName', 'slug'],
      through: { attributes: [] },
      ...(categoryId ? { where: { id: categoryId }, required: true } : { required: false })
    }];

    const { count, rows: exercises } = await Exercise.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']],
      distinct: true
    });

    res.json({
      exercises,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id, {
      include: [{
        model: ExerciseCategory,
        as: 'categories',
        attributes: ['id', 'name', 'englishName', 'slug'],
        through: { attributes: [] }
      }]
    });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    res.json(exercise);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createExercise = async (req, res) => {
  try {
    const { categoryIds, equipment, instructions, tips, ...exerciseData } = req.body;

    const parsedEquipment = typeof equipment === 'string' ? JSON.parse(equipment) : equipment;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedTips = typeof tips === 'string' ? JSON.parse(tips) : tips;
    const parsedCategoryIds = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;

    let imageUrl = exerciseData.imageUrl;
    let imageKey = null;
    if (req.files && req.files.image && req.files.image[0]) {
      const uploaded = await uploadExerciseImage(req.files.image[0], exerciseData.name);
      if (uploaded) {
        imageUrl = uploaded.imageUrl;
        imageKey = uploaded.imageKey;
      }
    }

    let videoUrl = exerciseData.videoUrl;
    let videoKey = null;
    if (req.files && req.files.videoUrl && req.files.videoUrl[0]) {
      const uploaded = await uploadExerciseVideo(req.files.videoUrl[0], exerciseData.name);
      if (uploaded) {
        videoUrl = uploaded.videoUrl;
        videoKey = uploaded.videoKey;
      }
    }

    const exercise = await Exercise.create({
      ...exerciseData,
      equipment: parsedEquipment || [],
      instructions: parsedInstructions || [],
      tips: parsedTips || [],
      imageUrl,
      videoUrl,
      createdBy: req.user.id,
      isCustom: false
    });

    if (parsedCategoryIds && Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
      await exercise.setCategories(parsedCategoryIds);
    }

    await exercise.reload({
      include: [{
        model: ExerciseCategory,
        as: 'categories',
        attributes: ['id', 'name', 'englishName', 'slug'],
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const { categoryIds, equipment, instructions, tips, ...exerciseData } = req.body;

    const parsedEquipment = typeof equipment === 'string' ? JSON.parse(equipment) : equipment;
    const parsedInstructions = typeof instructions === 'string' ? JSON.parse(instructions) : instructions;
    const parsedTips = typeof tips === 'string' ? JSON.parse(tips) : tips;
    const parsedCategoryIds = typeof categoryIds === 'string' ? JSON.parse(categoryIds) : categoryIds;

    let imageUrl = exerciseData.imageUrl;
    if (req.files && req.files.image && req.files.image[0]) {
      if (exercise.imageUrl) {
        const oldImageKey = extractPublicId(exercise.imageUrl);
        if (oldImageKey) {
          await deleteFromCloudinary(oldImageKey);
        }
      }

      const uploaded = await uploadExerciseImage(req.files.image[0], exerciseData.name || exercise.name);
      if (uploaded) {
        imageUrl = uploaded.imageUrl;
      }
    }

    let videoUrl = exerciseData.videoUrl;
    if (req.files && req.files.videoUrl && req.files.videoUrl[0]) {
      if (exercise.videoUrl) {
        const oldVideoKey = extractPublicId(exercise.videoUrl);
        if (oldVideoKey) {
          await deleteFromCloudinary(oldVideoKey, 'video');
        }
      }

      const uploaded = await uploadExerciseVideo(req.files.videoUrl[0], exerciseData.name || exercise.name);
      if (uploaded) {
        videoUrl = uploaded.videoUrl;
      }
    }

    await exercise.update({
      ...exerciseData,
      equipment: parsedEquipment !== undefined ? parsedEquipment : exercise.equipment,
      instructions: parsedInstructions !== undefined ? parsedInstructions : exercise.instructions,
      tips: parsedTips !== undefined ? parsedTips : exercise.tips,
      imageUrl: imageUrl !== undefined ? imageUrl : exercise.imageUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : exercise.videoUrl
    });

    if (parsedCategoryIds !== undefined) {
      if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
        await exercise.setCategories(parsedCategoryIds);
      } else {
        await exercise.setCategories([]);
      }
    }

    await exercise.reload({
      include: [{
        model: ExerciseCategory,
        as: 'categories',
        attributes: ['id', 'name', 'englishName', 'slug'],
        through: { attributes: [] }
      }]
    });

    res.json({
      message: 'Exercise updated successfully',
      exercise
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    if (exercise.imageUrl) {
      const imageKey = extractPublicId(exercise.imageUrl);
      if (imageKey) {
        await deleteFromCloudinary(imageKey);
      }
    }

    if (exercise.videoUrl) {
      const videoKey = extractPublicId(exercise.videoUrl);
      if (videoKey) {
        await deleteFromCloudinary(videoKey, 'video');
      }
    }

    await exercise.destroy();

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== CONTENT MANAGEMENT - WORKOUTS ====================

exports.getWorkouts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', difficulty = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const { count, rows: workouts } = await Workout.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });

    res.json({
      workouts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    res.json(workout);
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      createdBy: req.user.id,
      isCustom: false
    });

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.update(req.body);

    res.json({
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.destroy();

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== CONTENT MANAGEMENT - WORKOUT PLANS ====================

exports.getWorkoutPlans = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', goal = '', difficulty = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (goal) where.goal = goal;
    if (difficulty) where.difficulty = difficulty;

    const { count, rows: plans } = await WorkoutPlan.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });

    res.json({
      plans,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    await plan.destroy();

    res.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== GOOGLE SHEETS IMPORT ====================

exports.validateImportSheet = async (req, res) => {
  try {
    const { spreadsheetUrl, range = 'Sheet1', apiKey } = req.body;

    if (!spreadsheetUrl) {
      return res.status(400).json({ message: 'Spreadsheet URL is required' });
    }

    const spreadsheetId = googleSheetsService.constructor.extractSpreadsheetId(spreadsheetUrl);

    const key = apiKey || process.env.GOOGLE_SHEETS_API_KEY;
    if (!key) {
      return res.status(400).json({
        message: 'Google Sheets API key is required. Please provide it or set GOOGLE_SHEETS_API_KEY environment variable.'
      });
    }

    await googleSheetsService.initialize(key);

    const validation = await googleSheetsService.validateSpreadsheet(spreadsheetId, range);

    res.json(validation);
  } catch (error) {
    console.error('Validate sheet error:', error);
    res.status(500).json({
      message: 'Failed to validate spreadsheet',
      error: error.message
    });
  }
};

exports.importExercises = async (req, res) => {
  try {
    const { spreadsheetUrl, range = 'Sheet1', apiKey, updateExisting = false } = req.body;

    if (!spreadsheetUrl) {
      return res.status(400).json({ message: 'Spreadsheet URL is required' });
    }

    const spreadsheetId = googleSheetsService.constructor.extractSpreadsheetId(spreadsheetUrl);

    const key = apiKey || process.env.GOOGLE_SHEETS_API_KEY;
    if (!key) {
      return res.status(400).json({
        message: 'Google Sheets API key is required. Please provide it or set GOOGLE_SHEETS_API_KEY environment variable.'
      });
    }

    await googleSheetsService.initialize(key);

    const results = await googleSheetsService.importExercises(
      spreadsheetId,
      range,
      { updateExisting: updateExisting === true || updateExisting === 'true' }
    );

    res.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Import exercises error:', error);
    res.status(500).json({
      message: 'Failed to import exercises',
      error: error.message
    });
  }
};

exports.getImportTemplate = async (req, res) => {
  try {
    const template = {
      requiredColumns: ['Name'],
      optionalColumns: [
        'Description',
        'Category',
        'Difficulty',
        'CategoryNames',
        'MuscleGroups',
        'Equipment',
        'Sets',
        'Reps',
        'Duration',
        'RestTime',
        'CaloriesPerMinute',
        'Instructions',
        'Tips',
        'ImageUrl',
        'VideoUrl'
      ],
      exampleData: [
        {
          Name: 'Push-ups',
          Description: 'Classic upper body exercise',
          Category: 'strength',
          Difficulty: 'beginner',
          CategoryNames: 'Ngực, Vai, Tay sau',
          MuscleGroups: 'Triceps, Deltoids',
          Equipment: 'None',
          Sets: 3,
          Reps: 10,
          Duration: 0,
          RestTime: 60,
          CaloriesPerMinute: 7
        }
      ],
      notes: [
        'CategoryNames: Nhóm cơ chính - sẽ map với ExerciseCategory trong database',
        'MuscleGroups: Nhóm cơ phụ - lưu trực tiếp vào field muscleGroups',
        'Các trường array (CategoryNames, MuscleGroups, Equipment, Instructions, Tips) có thể phân cách bằng dấu phẩy hoặc xuống dòng',
        'Category: cardio, strength, flexibility, balance, sports',
        'Difficulty: beginner, intermediate, advanced'
      ]
    };

    res.json(template);
  } catch (error) {
    console.error('Get import template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== SYSTEM STATISTICS ====================

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const totalExercises = await Exercise.count();
    const totalWorkouts = await Workout.count();
    const totalPlans = await WorkoutPlan.count();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        recent: recentUsers
      },
      content: {
        exercises: totalExercises,
        workouts: totalWorkouts,
        plans: totalPlans
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
