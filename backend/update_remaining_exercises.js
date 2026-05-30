const { Exercise } = require('./models/Workout');
const { sequelize } = require('./config/database');

const updates = [
  { id: 24, imageUrl: 'https://www.rehabhero.ca/wp-content/uploads/2019/04/Shoulder-CARs.jpg' },
  { id: 26, imageUrl: 'https://www.rehabhero.ca/wp-content/uploads/2019/02/Ankle-Mobility.jpg' },
  { id: 29, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Push-up.gif' },
  { id: 50, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Cable-chest-fly.gif' },
  { id: 51, imageUrl: 'https://www.rehabhero.ca/wp-content/uploads/2019/02/Thoracic-Extension-Foam-Roll.jpg' },
  { id: 52, imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Burpee-Tuck-Jump.gif' }
];

async function updateRemainingExercises() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    for (const update of updates) {
      const [affectedRows] = await Exercise.update(
        { imageUrl: update.imageUrl },
        { where: { id: update.id } }
      );
      if (affectedRows > 0) {
        console.log(`Updated Exercise ID ${update.id} with new image.`);
      } else {
        console.log(`Exercise ID ${update.id} not found or no change.`);
      }
    }

    console.log('Remaining updates completed.');
  } catch (error) {
    console.error('Error updating exercises:', error);
  } finally {
    await sequelize.close();
  }
}

updateRemainingExercises();
