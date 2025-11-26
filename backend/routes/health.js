const express = require('express');
const { 
  SleepRecord, 
  HeartRateRecord, 
  StressRecord, 
  WeightRecord, 
  ActivityRecord,
  BreathingExercise,
  HealthGoal 
} = require('../models/Health');
const { User } = require('../models/User');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get health metrics summary
router.get('/metrics', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Get today's records
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const [sleep, heartRate, stress, weight, activity] = await Promise.all([
      SleepRecord.findOne({ 
        where: {
          user_id: req.user.id,
          date: { [Op.between]: [startDate, endDate] }
        }
      }),
      HeartRateRecord.findOne({ 
        where: {
          user_id: req.user.id,
          timestamp: { [Op.between]: [startDate, endDate] }
        },
        order: [['timestamp', 'DESC']]
      }),
      StressRecord.findOne({ 
        where: {
          user_id: req.user.id,
          timestamp: { [Op.between]: [startDate, endDate] }
        },
        order: [['timestamp', 'DESC']]
      }),
      WeightRecord.findOne({ 
        where: {
          user_id: req.user.id,
          timestamp: { [Op.between]: [startDate, endDate] }
        },
        order: [['timestamp', 'DESC']]
      }),
      ActivityRecord.findOne({
        where: {
          user_id: req.user.id,
          date: { [Op.between]: [startDate, endDate] }
        }
      })])

    res.json({
      sleep,
      heartRate,
      stress,
      weight,
      activity
    });
  } catch (error) {
    console.error('Get health metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sleep tracking routes
router.post('/sleep', auth, async (req, res) => {
  try {
    const sleepData = {
      ...req.body,
      user_id: req.user.id
    };

    const sleepRecord = await SleepRecord.create(sleepData);

    res.status(201).json({
      message: 'Sleep record added successfully',
      record: sleepRecord
    });
  } catch (error) {
    console.error('Add sleep record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sleep', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    const where = { user_id: req.user.id };
    if (startDate && endDate) {
      where.date = { 
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sleepRecords = await SleepRecord.findAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(sleepRecords);
  } catch (error) {
    console.error('Get sleep records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Heart rate tracking routes
router.post('/heart-rate', auth, async (req, res) => {
  try {
    const heartRateData = {
      ...req.body,
      user_id: req.user.id,
      timestamp: req.body.timestamp || new Date()
    };

    const heartRateRecord = await HeartRateRecord.create(heartRateData);

    res.status(201).json({
      message: 'Heart rate record added successfully',
      record: heartRateRecord
    });
  } catch (error) {
    console.error('Add heart rate record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/heart-rate', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 100 } = req.query;
    
    const where = { user_id: req.user.id };
    if (startDate && endDate) {
      where.timestamp = { 
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const heartRateRecords = await HeartRateRecord.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(heartRateRecords);
  } catch (error) {
    console.error('Get heart rate records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stress tracking routes
router.post('/stress', auth, async (req, res) => {
  try {
    const stressData = {
      ...req.body,
      user_id: req.user.id,
      timestamp: req.body.timestamp || new Date()
    };

    const stressRecord = await StressRecord.create(stressData);

    res.status(201).json({
      message: 'Stress record added successfully',
      record: stressRecord
    });
  } catch (error) {
    console.error('Add stress record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stress', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    const where = { user_id: req.user.id };
    if (startDate && endDate) {
      where.timestamp = { 
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const stressRecords = await StressRecord.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(stressRecords);
  } catch (error) {
    console.error('Get stress records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Weight tracking routes
router.post('/weight', auth, async (req, res) => {
  try {
    const weightData = {
      ...req.body,
      user_id: req.user.id,
      timestamp: req.body.timestamp || new Date()
    };

    // Calculate BMI if height is available
    const user = await User.findByPk(req.user.id);
    if (user && user.height) {
      const heightInMeters = user.height / 100;
      weightData.bmi = weightData.weight / (heightInMeters * heightInMeters);
    }

    const weightRecord = await WeightRecord.create(weightData);

    res.status(201).json({
      message: 'Weight record added successfully',
      record: weightRecord
    });
  } catch (error) {
    console.error('Add weight record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/weight', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    const where = { user_id: req.user.id };
    if (startDate && endDate) {
      where.timestamp = { 
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const weightRecords = await WeightRecord.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(weightRecords);
  } catch (error) {
    console.error('Get weight records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activity tracking routes
router.get('/activity', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    const where = { user_id: req.user.id };
    if (startDate && endDate) {
      where.date = { 
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const activityRecords = await ActivityRecord.findAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(activityRecords);
  } catch (error) {
    console.error('Get activity records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/activity', auth, async (req, res) => {
  try {
    const { activityType, duration, caloriesBurned, steps, date } = req.body;
    
    const newActivity = await ActivityRecord.create({
      user_id: req.user.id,
      activityType,
      duration,
      caloriesBurned,
      steps,
      date: date ? new Date(date) : new Date()
    });

    res.json(newActivity);
  } catch (error) {
    console.error('Add activity record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Breathing exercises routes
router.get('/breathing', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const where = { user_id: req.user.id };
    if (startDate && endDate) {
      where.timestamp = { 
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const breathingExercises = await BreathingExercise.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(breathingExercises);
  } catch (error) {
    console.error('Get breathing exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/breathing', auth, async (req, res) => {
  try {
    const breathingData = {
      ...req.body,
      user_id: req.user.id,
      timestamp: req.body.timestamp || new Date()
    };

    const breathingExercise = await BreathingExercise.create(breathingData);

    res.status(201).json({
      message: 'Breathing exercise logged successfully',
      record: breathingExercise
    });
  } catch (error) {
    console.error('Add breathing exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health goals routes
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await HealthGoal.findAll({
      where: {
        user_id: req.user.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(goals);
  } catch (error) {
    console.error('Get health goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/goals', auth, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      user_id: req.user.id
    };

    const goal = await HealthGoal.create(goalData);

    res.status(201).json({
      message: 'Health goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create health goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/goals/:id', auth, async (req, res) => {
  try {
    const goal = await HealthGoal.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }

    await goal.update(req.body);

    res.json({
      message: 'Health goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('Update health goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
