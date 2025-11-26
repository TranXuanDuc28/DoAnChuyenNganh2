/**
 * Script to reset admin password
 * Usage: node scripts/reset-admin-password.js <email> <newPassword>
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');

async function resetAdminPassword() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully\n');

    // Get arguments from command line
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error('Error: Email and new password are required');
      console.log('Usage: node scripts/reset-admin-password.js <email> <newPassword>');
      console.log('Example: node scripts/reset-admin-password.js admin@gmail.com newpassword123');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error(`Error: User with email ${email} not found`);
      process.exit(1);
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.error(`Error: User ${email} is not an admin`);
      process.exit(1);
    }

    // Update password (the beforeUpdate hook will hash it)
    user.password = newPassword;
    await user.save();

    console.log('✅ Admin password reset successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`New password has been set.`);

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error.message);
    console.error(error);
    process.exit(1);
  }
}

resetAdminPassword();








