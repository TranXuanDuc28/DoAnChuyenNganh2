const { Food, NutritionEntry, NutritionGoal, MealPlan, WaterIntake, FoodLog, MealCompletion } = require('../models/Nutrition');
const { Op } = require('sequelize');
const mealPlanService = require('../services/mealPlanService');

exports.getFoods = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;

    const where = {};
    if (category) where.category = category;

    const foods = await Food.findAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['name', 'ASC']]
    });

    res.json(foods);
  } catch (error) {
    console.error('Get foods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchFoods = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const foods = await Food.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { brand: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findByPk(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createFood = async (req, res) => {
  try {
    const foodData = {
      ...req.body,
      createdBy: req.user.id,
      isCustom: true
    };

    const food = await Food.create(foodData);

    res.status(201).json({
      message: 'Food created successfully',
      food
    });
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEntries = async (req, res) => {
  try {
    const { date, mealType, limit = 50 } = req.query;

    const where = { userId: req.user.id };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    if (mealType) where.mealType = mealType;

    const entries = await NutritionEntry.findAll({
      where,
      include: [Food],
      order: [['loggedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(entries);
  } catch (error) {
    console.error('Get nutrition entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addEntry = async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      userId: req.user.id,
      date: req.body.date || new Date()
    };

    const entry = await NutritionEntry.create(entryData);
    const entryWithFood = await NutritionEntry.findByPk(entry.id, {
      include: [Food]
    });

    res.status(201).json({
      message: 'Nutrition entry added successfully',
      entry: entryWithFood
    });
  } catch (error) {
    console.error('Add nutrition entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const entry = await NutritionEntry.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    await entry.update(req.body);
    const updatedEntry = await NutritionEntry.findByPk(entry.id, {
      include: [Food]
    });

    res.json({
      message: 'Nutrition entry updated successfully',
      entry: updatedEntry
    });
  } catch (error) {
    console.error('Update nutrition entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await NutritionEntry.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    await entry.destroy();

    res.json({ message: 'Nutrition entry deleted successfully' });
  } catch (error) {
    console.error('Delete nutrition entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await NutritionGoal.findOne({
      where: {
        userId: req.user.id,
        isActive: true
      }
    });

    if (!goals) {
      const defaultGoals = {
        targetCalories: 2000,
        macronutrients: {
          protein: { percentage: 25, grams: 125 },
          carbohydrates: { percentage: 45, grams: 225 },
          fat: { percentage: 30, grams: 67 }
        },
        waterIntake: 2000
      };
      return res.json(defaultGoals);
    }

    res.json(goals);
  } catch (error) {
    console.error('Get nutrition goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateGoals = async (req, res) => {
  try {
    const [goals] = await NutritionGoal.findOrCreate({
      where: {
        userId: req.user.id,
        isActive: true
      },
      defaults: {
        ...req.body,
        userId: req.user.id
      }
    });

    if (goals) {
      await goals.update(req.body);
    }

    res.json({
      message: 'Nutrition goals updated successfully',
      goals
    });
  } catch (error) {
    console.error('Update nutrition goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWaterIntake = async (req, res) => {
  try {
    const { date } = req.query;

    const where = { userId: req.user.id };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const waterEntries = await WaterIntake.findAll({
      where,
      order: [['date', 'DESC']]
    });

    const totalWater = waterEntries.reduce((sum, entry) => sum + entry.amount, 0);

    res.json({
      entries: waterEntries,
      totalAmount: totalWater,
      count: waterEntries.length
    });
  } catch (error) {
    console.error('Get water intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addWaterIntake = async (req, res) => {
  try {
    const waterData = {
      userId: req.user.id,
      amount: req.body.amount,
      date: req.body.date || new Date()
    };

    const waterEntry = await WaterIntake.create(waterData);

    res.status(201).json({
      message: 'Water intake logged successfully',
      entry: waterEntry
    });
  } catch (error) {
    console.error('Add water intake error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMealPlans = async (req, res) => {
  try {
    const result = await mealPlanService.getAllMealPlans(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal plans',
      error: error.message
    });
  }
};

exports.getActiveMealPlan = async (req, res) => {
  try {
    const result = await mealPlanService.getActiveMealPlan(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Get active meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active meal plan',
      error: error.message
    });
  }
};

exports.generateMealPlan = async (req, res) => {
  try {
    const {
      duration,
      mealsPerDay,
      dietaryRestrictions,
      cuisinePreferences,
      allergies
    } = req.body;

    console.log('Generating meal plan for user:', req.user.id);
    console.log('Options:', req.body);

    const result = await mealPlanService.generateMealPlan(req.user.id, {
      duration,
      mealsPerDay,
      dietaryRestrictions,
      cuisinePreferences,
      allergies
    });

    res.json(result);
  } catch (error) {
    console.error('Generate meal plan error:', error);

    if (error.message && error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: 'Meal plan generation timed out. The AI is taking longer than expected. Please try again with fewer days or simpler preferences.',
        error: 'TIMEOUT'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate meal plan',
      error: error.message
    });
  }
};

exports.deactivateMealPlan = async (req, res) => {
  try {
    const result = await mealPlanService.deactivateMealPlan(
      req.user.id,
      parseInt(req.params.id)
    );
    res.json(result);
  } catch (error) {
    console.error('Deactivate meal plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate meal plan',
      error: error.message
    });
  }
};

exports.addFoodLog = async (req, res) => {
  try {
    const {
      foodName,
      brand,
      barcode,
      mealType,
      servingSize,
      servingAmount,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      imageUrl,
      ingredients,
      logDate,
      logTime,
      notes
    } = req.body;

    if (!foodName || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Food name and meal type are required'
      });
    }

    const foodLog = await FoodLog.create({
      userId: req.user.id,
      foodName,
      brand: brand || null,
      barcode: barcode || null,
      mealType,
      servingSize: servingSize || '100g',
      servingAmount: servingAmount || 1,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      sugar: sugar || 0,
      sodium: sodium || 0,
      imageUrl: imageUrl || null,
      ingredients: ingredients || null,
      logDate: logDate || new Date(),
      logTime: logTime || null,
      notes: notes || null
    });

    return res.status(201).json({
      success: true,
      message: 'Food added to diary successfully',
      data: foodLog
    });

  } catch (error) {
    console.error('Add food log error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add food to diary',
      error: error.message
    });
  }
};

exports.getFoodLogs = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let whereClause = {
      userId: req.user.id
    };

    if (date) {
      whereClause.logDate = date;
    } else if (startDate && endDate) {
      whereClause.logDate = {
        [Op.between]: [startDate, endDate]
      };
    } else {
      const today = new Date().toISOString().split('T')[0];
      whereClause.logDate = today;
    }

    const foodLogs = await FoodLog.findAll({
      where: whereClause,
      order: [
        ['logDate', 'DESC'],
        ['logTime', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    const totals = foodLogs.reduce((acc, log) => {
      acc.calories += log.calories || 0;
      acc.protein += log.protein || 0;
      acc.carbs += log.carbs || 0;
      acc.fat += log.fat || 0;
      acc.fiber += log.fiber || 0;
      acc.sugar += log.sugar || 0;
      acc.sodium += log.sodium || 0;
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });

    res.json({
      success: true,
      data: {
        logs: foodLogs,
        totals,
        count: foodLogs.length
      }
    });

  } catch (error) {
    console.error('Get food logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch food logs',
      error: error.message
    });
  }
};

exports.deleteFoodLog = async (req, res) => {
  try {
    const { id } = req.params;

    const foodLog = await FoodLog.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!foodLog) {
      return res.status(404).json({
        success: false,
        message: 'Food log entry not found'
      });
    }

    await foodLog.destroy();
    console.log('Food log deleted:', id);

    res.json({
      success: true,
      message: 'Food log entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete food log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food log entry',
      error: error.message
    });
  }
};

exports.updateFoodLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const foodLog = await FoodLog.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!foodLog) {
      return res.status(404).json({
        success: false,
        message: 'Food log entry not found'
      });
    }

    const allowedFields = [
      'foodName', 'brand', 'mealType', 'servingSize', 'servingAmount',
      'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium',
      'imageUrl', 'ingredients', 'logDate', 'logTime', 'notes'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        foodLog[field] = updateData[field];
      }
    });

    await foodLog.save();
    console.log('Food log updated:', id);

    res.json({
      success: true,
      message: 'Food log entry updated successfully',
      data: foodLog
    });

  } catch (error) {
    console.error('Update food log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food log entry',
      error: error.message
    });
  }
};

exports.markMealCompletion = async (req, res) => {
  try {
    const { mealPlanId, mealId } = req.body;

    if (!mealPlanId || !mealId) {
      return res.status(400).json({
        success: false,
        message: 'Meal plan ID and meal ID are required'
      });
    }

    const [completion, created] = await MealCompletion.findOrCreate({
      where: {
        userId: req.user.id,
        mealPlanId,
        mealId
      },
      defaults: {
        userId: req.user.id,
        mealPlanId,
        mealId,
        completedAt: new Date()
      }
    });

    if (!created) {
      completion.completedAt = new Date();
      await completion.save();
    }

    return res.status(created ? 201 : 200).json({
      success: true,
      message: 'Meal marked as completed',
      data: completion
    });

  } catch (error) {
    console.error('Mark meal completion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark meal as completed',
      error: error.message
    });
  }
};

exports.getMealCompletions = async (req, res) => {
  try {
    const { mealPlanId, date } = req.query;

    const whereClause = { userId: req.user.id };

    if (mealPlanId) {
      whereClause.mealPlanId = mealPlanId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.completedAt = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }

    const completions = await MealCompletion.findAll({
      where: whereClause,
      order: [['completedAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: completions
    });

  } catch (error) {
    console.error('Get meal completions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch meal completions',
      error: error.message
    });
  }
};

exports.deleteMealCompletion = async (req, res) => {
  try {
    const { mealPlanId, mealId } = req.params;

    const deleted = await MealCompletion.destroy({
      where: {
        userId: req.user.id,
        mealPlanId,
        mealId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Meal completion not found'
      });
    }

    return res.json({
      success: true,
      message: 'Meal unmarked successfully'
    });

  } catch (error) {
    console.error('Delete meal completion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unmark meal',
      error: error.message
    });
  }
};
