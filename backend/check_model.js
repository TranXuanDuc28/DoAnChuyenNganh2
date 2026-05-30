const { Exercise } = require('./models/Workout');
const { sequelize } = require('./config/database');

async function checkModelOutput() {
  try {
    await sequelize.authenticate();
    console.log('DB Connected.');

    const { Op } = require('sequelize');
    const exercises = await Exercise.findAll({ 
      where: { 
        name: { [Op.in]: ['Box Jump', 'Burpees'] } 
      } 
    });
    exercises.forEach(ex => {
      console.log(`- ${ex.name} (ID: ${ex.id}): imageUrl = ${ex.imageUrl}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkModelOutput();
