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
const { auth } = require('../middleware/auth');
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
      SleepRecord.findOne({ user: req.user._id, date: { $gte: startDate, $lt: endDate } }),
      HeartRateRecord.findOne({ user: req.user._id, timestamp: { $gte: startDate, $lt: endDate } }).sort({ timestamp: -1 }),
      StressRecord.findOne({ user: req.user._id, timestamp: { $gte: startDate, $lt: endDate } }).sort({ timestamp: -1 }),
      WeightRecord.findOne({ user: req.user._id, timestamp: { $gte: startDate, $lt: endDate } }).sort({ timestamp: -1 }),
      ActivityRecord.findOne({ user: req.user._id, date: { $gte: startDate, $lt: endDate } })
    ]);

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
      user: req.user._id
    };

    const sleepRecord = new SleepRecord(sleepData);
    await sleepRecord.save();

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
    
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const sleepRecords = await SleepRecord.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1);

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
      user: req.user._id,
      timestamp: req.body.timestamp || new Date()
    };

    const heartRateRecord = new HeartRateRecord(heartRateData);
    await heartRateRecord.save();

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
    
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const heartRateRecords = await HeartRateRecord.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1);

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
      user: req.user._id,
      timestamp: req.body.timestamp || new Date()
    };

    const stressRecord = new StressRecord(stressData);
    await stressRecord.save();

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
    
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const stressRecords = await StressRecord.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1);

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
      user: req.user._id,
      timestamp: req.body.timestamp || new Date()
    };

    // Calculate BMI if height is available
    const user = await require('../models/User').findById(req.user._id);
    if (user && user.profile.height) {
      const heightInMeters = user.profile.height / 100;
      weightData.bmi = weightData.weight / (heightInMeters * heightInMeters);
    }

    const weightRecord = new WeightRecord(weightData);
    await weightRecord.save();

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
    
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const weightRecords = await WeightRecord.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1);

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
    
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.date = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const activityRecords = await ActivityRecord.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1);

    res.json(activityRecords);
  } catch (error) {
    console.error('Get activity records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Breathing exercises routes
router.get('/breathing', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.timestamp = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const breathingExercises = await BreathingExercise.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1);

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
      user: req.user._id,
      timestamp: req.body.timestamp || new Date()
    };

    const breathingExercise = new BreathingExercise(breathingData);
    await breathingExercise.save();

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
    const goals = await HealthGoal.find({
      user: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

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
      user: req.user._id
    };

    const goal = new HealthGoal(goalData);
    await goal.save();

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
      _id: req.params.id,
      user: req.user._id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }

    Object.assign(goal, req.body);
    await goal.save();

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
