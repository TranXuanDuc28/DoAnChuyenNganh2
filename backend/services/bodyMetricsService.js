const BodyMetricsHistory = require('../models/BodyMetricsHistory');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * Add a new body metrics entry and update user's current metrics
 */
async function addBodyMetrics(userId, metricsData) {
  const {
    weight,
    height,
    waistCircumference,
    hipCircumference,
    bodyFatPercentage,
    muscleMass,
    notes,
    recordedAt
  } = metricsData;

  // Validate required fields
  if (!weight) {
    throw new Error('Weight is required');
  }

  // Create new metrics entry
  const metrics = await BodyMetricsHistory.create({
    userId,
    weight: parseFloat(weight),
    height: height ? parseFloat(height) : null,
    waistCircumference: waistCircumference ? parseFloat(waistCircumference) : null,
    hipCircumference: hipCircumference ? parseFloat(hipCircumference) : null,
    bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : null,
    muscleMass: muscleMass ? parseFloat(muscleMass) : null,
    notes: notes || null,
    recordedAt: recordedAt ? new Date(recordedAt) : new Date()
  });

  // Update user's current metrics if this is the most recent entry
  await updateUserCurrentMetrics(userId);

  return metrics;
}

/**
 * Update user's current metrics based on the latest entry
 */
async function updateUserCurrentMetrics(userId) {
  const latestMetrics = await BodyMetricsHistory.findOne({
    where: { userId },
    order: [['recordedAt', 'DESC']]
  });

  if (!latestMetrics) {
    return;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return;
  }

  // Update user's metrics with the latest values
  user.weight = latestMetrics.weight;
  if (latestMetrics.height) user.height = latestMetrics.height;
  if (latestMetrics.waistCircumference) user.waistCircumference = latestMetrics.waistCircumference;
  if (latestMetrics.hipCircumference) user.hipCircumference = latestMetrics.hipCircumference;
  if (latestMetrics.bodyFatPercentage) user.bodyFatPercentage = latestMetrics.bodyFatPercentage;

  await user.save();
}

/**
 * Get metrics history for a user
 */
async function getMetricsHistory(userId, limit = 100) {
  return await BodyMetricsHistory.findAll({
    where: { userId },
    order: [['recordedAt', 'DESC']],
    limit
  });
}

/**
 * Get latest metrics for a user
 */
async function getLatestMetrics(userId) {
  return await BodyMetricsHistory.findOne({
    where: { userId },
    order: [['recordedAt', 'DESC']]
  });
}

/**
 * Get metrics statistics over a period
 */
async function getMetricsStats(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const metrics = await BodyMetricsHistory.findAll({
    where: {
      userId,
      recordedAt: {
        [Op.gte]: startDate
      }
    },
    order: [['recordedAt', 'ASC']],
    attributes: ['weight', 'bmi', 'whr', 'bodyFatPercentage', 'muscleMass', 'recordedAt']
  });

  // Calculate changes
  const stats = {
    totalEntries: metrics.length,
    dateRange: {
      start: startDate,
      end: new Date()
    }
  };

  if (metrics.length > 0) {
    const first = metrics[0];
    const last = metrics[metrics.length - 1];
    
    stats.weightChange = last.weight - first.weight;
    
    if (first.bmi && last.bmi) {
      stats.bmiChange = last.bmi - first.bmi;
    }
    
    if (first.bodyFatPercentage && last.bodyFatPercentage) {
      stats.bodyFatChange = last.bodyFatPercentage - first.bodyFatPercentage;
    }
    
    if (first.muscleMass && last.muscleMass) {
      stats.muscleMassChange = last.muscleMass - first.muscleMass;
    }
    
    stats.data = metrics;
  }

  return stats;
}

/**
 * Update a metrics entry
 */
async function updateMetrics(userId, metricsId, updateData) {
  const metrics = await BodyMetricsHistory.findOne({
    where: { id: metricsId, userId }
  });

  if (!metrics) {
    throw new Error('Metrics entry not found');
  }

  // Update fields
  if (updateData.weight) metrics.weight = parseFloat(updateData.weight);
  if (updateData.height) metrics.height = parseFloat(updateData.height);
  if (updateData.waistCircumference) metrics.waistCircumference = parseFloat(updateData.waistCircumference);
  if (updateData.hipCircumference) metrics.hipCircumference = parseFloat(updateData.hipCircumference);
  if (updateData.bodyFatPercentage) metrics.bodyFatPercentage = parseFloat(updateData.bodyFatPercentage);
  if (updateData.muscleMass) metrics.muscleMass = parseFloat(updateData.muscleMass);
  if (updateData.notes !== undefined) metrics.notes = updateData.notes;

  await metrics.save();

  // Update user's current metrics if this is the most recent entry
  await updateUserCurrentMetrics(userId);

  return metrics;
}

/**
 * Delete a metrics entry
 */
async function deleteMetrics(userId, metricsId) {
  const metrics = await BodyMetricsHistory.findOne({
    where: { id: metricsId, userId }
  });

  if (!metrics) {
    throw new Error('Metrics entry not found');
  }

  await metrics.destroy();

  // Update user's current metrics after deletion
  await updateUserCurrentMetrics(userId);
}

/**
 * Get progress toward target weight
 */
async function getWeightProgress(userId) {
  const user = await User.findByPk(userId);
  if (!user || !user.targetWeight) {
    return null;
  }

  const latestMetrics = await getLatestMetrics(userId);
  if (!latestMetrics) {
    return null;
  }

  const currentWeight = latestMetrics.weight;
  const targetWeight = user.targetWeight;
  const startWeight = user.weight; // This could be the weight at signup

  const totalWeightToLose = startWeight - targetWeight;
  const weightLostSoFar = startWeight - currentWeight;
  const remainingWeight = currentWeight - targetWeight;
  
  const progress = totalWeightToLose !== 0 
    ? (weightLostSoFar / totalWeightToLose) * 100 
    : 0;

  return {
    currentWeight,
    targetWeight,
    startWeight,
    weightLostSoFar,
    remainingWeight,
    progress: Math.max(0, Math.min(100, progress)), // Clamp between 0-100
    isOnTrack: remainingWeight > 0
  };
}

module.exports = {
  addBodyMetrics,
  updateUserCurrentMetrics,
  getMetricsHistory,
  getLatestMetrics,
  getMetricsStats,
  updateMetrics,
  deleteMetrics,
  getWeightProgress
};

