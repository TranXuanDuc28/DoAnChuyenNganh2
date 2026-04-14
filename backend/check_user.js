const { sequelize } = require('./config/database');
const User = require('./models/User');

async function checkUser() {
  try {
    const email = 'vku@gmail.com';
    const user = await User.findOne({ where: { email } });
    if (user) {
      console.log('USER_FOUND:', JSON.stringify(user.toJSON(), null, 2));
    } else {
      console.log('USER_NOT_FOUND');
    }
    process.exit(0);
  } catch (error) {
    console.error('CHECK_ERROR:', error);
    process.exit(1);
  }
}

checkUser();
