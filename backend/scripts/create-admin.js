/**
 * Script to create an admin account
 * Usage: node scripts/create-admin.js <email> <password> <firstName> <lastName>
 * Or: node scripts/create-admin.js (interactive mode)
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Get arguments from command line or use interactive mode
    let email, password, firstName, lastName;

    if (process.argv.length >= 6) {
      // Command line arguments
      [, , email, password, firstName, lastName] = process.argv;
    } else {
      // Interactive mode - would need readline, but for simplicity, use defaults
      console.log('Usage: node scripts/create-admin.js <email> <password> <firstName> <lastName>');
      console.log('Example: node scripts/create-admin.js admin@example.com password123 Admin User');
      process.exit(1);
    }

    // Validate inputs
    if (!email || !password || !firstName || !lastName) {
      console.error('Error: All fields are required');
      console.log('Usage: node scripts/create-admin.js <email> <password> <firstName> <lastName>');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      if (existingUser.role === 'admin') {
        console.log('This user is already an admin.');
      } else {
        console.log('Updating existing user to admin...');
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('User updated to admin successfully!');
        process.exit(0);
      }
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isActive: true,
      onboardingCompleted: true
    });

    console.log('✅ Admin account created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`Role: ${admin.role}`);
    console.log(`ID: ${admin.id}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

