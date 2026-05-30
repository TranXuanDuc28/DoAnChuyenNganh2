const { Exercise } = require('./models/Workout');
const { sequelize } = require('./config/database');

const updates = [
  { id: 17, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Mountain-climbers.gif' },
  { id: 18, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Burpee.gif' },
  { id: 23, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Pull-up.gif' },
  { id: 28, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Bench-press.gif' },
  { id: 31, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Deadlift.gif' },
  { id: 25, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Squat.gif' },
  { id: 30, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Lat-pulldown.gif' },
  { id: 32, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Shoulder-press.gif' },
  { id: 22, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Tricep-dips.gif' },
  { id: 53, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/09/Box-jump.gif' },
  { id: 27, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Lunge.gif' },
  { id: 57, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Chin-up.gif' },
  { id: 55, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Preacher-curl.gif' },
  { id: 56, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Skull-crusher.gif' },
  { id: 54, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/Face-pull.gif' },
  { id: 58, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/12/Rowing-machine.gif' },
  { id: 10, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/04/Shoulder-stretch.jpg' },
  { id: 19, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/03/High-knees.gif' },
  { id: 20, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/04/Hamstring-stretch.jpg' },
  { id: 21, imageUrl: 'https://www.strengthlog.com/wp-content/uploads/2020/04/Quad-stretch.jpg' }
];

async function updateExercises() {
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

    console.log('All updates completed.');
  } catch (error) {
    console.error('Error updating exercises:', error);
  } finally {
    await sequelize.close();
  }
}

updateExercises();
