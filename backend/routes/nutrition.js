const express = require('express');
const { Food, NutritionEntry, NutritionGoal, MealPlan, WaterIntake } = require('../models/Nutrition');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get food database
router.get('/foods', auth, async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;

    const foods = await Food.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

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

    const foods = await Food.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(limit * 1)
    .sort({ name: 1 });

    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single food
router.get('/foods/:id', auth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
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
      createdBy: req.user._id,
      isCustom: true
    };

    const food = new Food(foodData);
    await food.save();

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
    
    const filter = { user: req.user._id };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    if (mealType) filter.mealType = mealType;

    const entries = await NutritionEntry.find(filter)
      .populate('food')
      .sort({ loggedAt: -1 })
      .limit(limit * 1);

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
      user: req.user._id,
      date: req.body.date || new Date()
    };

    const entry = new NutritionEntry(entryData);
    await entry.save();

    await entry.populate('food');

    res.status(201).json({
      message: 'Nutrition entry added successfully',
      entry
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
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    const updatedEntry = await NutritionEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('food');

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
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Nutrition entry not found' });
    }

    await NutritionEntry.findByIdAndDelete(req.params.id);

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
      user: req.user._id,
      isActive: true
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
    const goals = await NutritionGoal.findOne({
      user: req.user._id,
      isActive: true
    });

    if (goals) {
      Object.assign(goals, req.body);
      await goals.save();
    } else {
      const newGoals = new NutritionGoal({
        ...req.body,
        user: req.user._id
      });
      await newGoals.save();
    }

    res.json({
      message: 'Nutrition goals updated successfully',
      goals: goals || await NutritionGoal.findOne({ user: req.user._id, isActive: true })
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
    
    const filter = { user: req.user._id };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    const waterEntries = await WaterIntake.find(filter).sort({ loggedAt: -1 });
    
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
      user: req.user._id,
      amount: req.body.amount,
      date: req.body.date || new Date()
    };

    const waterEntry = new WaterIntake(waterData);
    await waterEntry.save();

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
    const mealPlans = await MealPlan.find({
      user: req.user._id,
      isActive: true
    })
    .populate('meals.meal')
    .sort({ createdAt: -1 });

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
      user: req.user._id
    };

    const mealPlan = new MealPlan(mealPlanData);
    await mealPlan.save();

    await mealPlan.populate('meals.meal');

    res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
