const express = require('express');
const { Food, NutritionEntry, NutritionGoal, MealPlan, WaterIntake } = require('../models/Nutrition');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get food database
router.get('/foods', auth, async (req, res) => {
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
});

// Search foods
router.get('/foods/search', auth, async (req, res) => {
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
});

// Get single food
router.get('/foods/:id', auth, async (req, res) => {
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
});

// Create custom food
router.post('/foods', auth, async (req, res) => {
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
});

// Get nutrition entries
router.get('/entries', auth, async (req, res) => {
  try {
    const { date, mealType, limit = 50 } = req.query;
    
    const where = { user_id: req.user.id };
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
});

// Add nutrition entry
router.post('/entries', auth, async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      user_id: req.user.id,
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
});

// Update nutrition entry
router.put('/entries/:id', auth, async (req, res) => {
  try {
    const entry = await NutritionEntry.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
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
});

// Delete nutrition entry
router.delete('/entries/:id', auth, async (req, res) => {
  try {
    const entry = await NutritionEntry.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
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
});

// Get nutrition goals
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await NutritionGoal.findOne({
      where: {
        user_id: req.user.id,
        isActive: true
      }
    });

    if (!goals) {
      // Return default goals if none exist
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
});

// Update nutrition goals
router.put('/goals', auth, async (req, res) => {
  try {
    const [goals] = await NutritionGoal.findOrCreate({
      where: {
        user_id: req.user.id,
        isActive: true
      },
      defaults: {
        ...req.body,
        user_id: req.user.id
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
});

// Get water intake
router.get('/water', auth, async (req, res) => {
  try {
    const { date } = req.query;
    
    const where = { user_id: req.user.id };
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
      order: [['loggedAt', 'DESC']]
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
});

// Add water intake
router.post('/water', auth, async (req, res) => {
  try {
    const waterData = {
      user_id: req.user.id,
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
});

// Get meal plans
router.get('/meal-plans', auth, async (req, res) => {
  try {
    const mealPlans = await MealPlan.findAll({
      where: {
        user_id: req.user.id,
        isActive: true
      },
      include: [{
        model: Meal,
        through: { attributes: [] }
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(mealPlans);
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create meal plan
router.post('/meal-plans', auth, async (req, res) => {
  try {
    const mealPlanData = {
      ...req.body,
      user_id: req.user.id
    };

    const mealPlan = await MealPlan.create(mealPlanData);
    
    if (req.body.meals && Array.isArray(req.body.meals)) {
      await mealPlan.setMeals(req.body.meals.map(m => m.id));
    }

    const mealPlanWithMeals = await MealPlan.findByPk(mealPlan.id, {
      include: [{
        model: Meal,
        through: { attributes: [] }
      }]
    });

    res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan: mealPlanWithMeals
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
