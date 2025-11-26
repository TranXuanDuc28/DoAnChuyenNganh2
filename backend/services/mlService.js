const axios = require('axios');

// Python ML service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Get diet and exercise recommendations from ML model
 * @param {Object} userData - User data for prediction
 * @returns {Promise<Object>} Prediction results
 */
const getPredictions = async (userData) => {
  try {
    const {
      sex,
      age,
      height,
      weight,
      hypertension = 'No',
      diabetes = 'No',
      fitnessGoal = 'Weight Loss',
      fitnessType = 'Cardio Fitness'
    } = userData;

    // Map gender to ML model format
    const sexFormatted = sex === 'male' ? 'Male' : sex === 'female' ? 'Female' : 'Male';

    // Map fitness goals to ML model format
    const fitnessGoalFormatted = fitnessGoal === 'weight_loss' ? 'Weight Loss' : 
                                 fitnessGoal === 'weight_gain' ? 'Weight Gain' :
                                 fitnessGoal === 'muscle_gain' ? 'Weight Gain' :
                                 'Weight Loss';

    // Map fitness type to ML model format
    const fitnessTypeFormatted = fitnessType === 'cardio' ? 'Cardio Fitness' :
                                 fitnessType === 'strength' ? 'Muscular Fitness' :
                                 'Cardio Fitness';

    const requestData = {
      sex: sexFormatted,
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight),
      hypertension: hypertension === 'yes' ? 'Yes' : 'No',
      diabetes: diabetes === 'yes' ? 'Yes' : 'No',
      fitnessGoal: fitnessGoalFormatted,
      fitnessType: fitnessTypeFormatted
    };

    console.log('Calling ML service with data:', requestData);

    const response = await axios.post(`${ML_SERVICE_URL}/predict`, requestData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return {
        success: true,
        exercise: response.data.data.exercise,
        diet: response.data.data.diet,
        bmi: response.data.data.bmi,
        level: response.data.data.level,
        userInfo: response.data.data.userInfo
      };
    } else {
      throw new Error(response.data.error || 'ML prediction failed');
    }
  } catch (error) {
    console.error('ML Service Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('ML service is not running. Please start the Python service.');
    }
    
    throw new Error(`Failed to get predictions: ${error.message}`);
  }
};

/**
 * Check if ML service is healthy
 * @returns {Promise<boolean>}
 */
const checkHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('ML service health check failed:', error.message);
    return false;
  }
};

module.exports = {
  getPredictions,
  checkHealth
};

