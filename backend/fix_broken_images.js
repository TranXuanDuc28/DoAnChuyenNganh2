const { Exercise } = require('./models/Workout');
const { sequelize } = require('./config/database');

const updates = [
  { id: 53, imageUrl: 'https://www.spotebi.com/wp-content/uploads/2015/02/box-jumps-exercise-illustration.jpg' },
  { id: 18, imageUrl: 'https://www.spotebi.com/wp-content/uploads/2014/10/burpees-exercise-illustration-736x391.jpg' }
];

async function updateFix() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    for (const update of updates) {
      const [affectedRows] = await Exercise.update(
        { imageUrl: update.imageUrl },
        { where: { id: update.id } }
      );
      if (affectedRows > 0) {
        console.log(`Updated Exercise ID ${update.id} with new working image.`);
      }
    }

    console.log('Fix completed.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateFix();
