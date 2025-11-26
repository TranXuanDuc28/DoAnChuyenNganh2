/**
 * Script to check if admin users exist in the database
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const User = require('../models/User');

async function checkAdmin() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully\n');

    // Find all admin users
    const admins = await User.findAll({ 
      where: { role: 'admin' },
      attributes: ['id', 'email', 'firstName', 'lastName', 'isActive', 'role']
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in the database');
      console.log('\nTo create an admin user, run:');
      console.log('node scripts/create-admin.js <email> <password> <firstName> <lastName>');
      console.log('\nExample:');
      console.log('node scripts/create-admin.js admin@example.com password123 Admin User');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log(`   Role: ${admin.role}\n`);
      });
    }

    // Also check all users
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });
    console.log(`\nTotal users in database: ${allUsers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAdmin();








