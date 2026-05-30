const { Exercise } = require('./models/Workout');
const { sequelize } = require('./config/database');

async function checkExercises() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const exercises = await Exercise.findAll();
    console.log(`Total exercises: ${exercises.length}`);

    exercises.forEach(ex => {
      console.log(`- ID: ${ex.id}, Name: ${ex.name}, Image: ${ex.imageUrl}`);
    });

    const missingImages = exercises.filter(ex => !ex.imageUrl || ex.imageUrl.trim() === '' || ex.imageUrl.includes('placeholder'));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkExercises();
