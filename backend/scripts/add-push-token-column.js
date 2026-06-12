/**
 * Script to add 'push_token' column to users table
 * Run this if you get "Unknown column 'push_token'" error
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

async function addPushTokenColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check if column exists first
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'push_token'
    `);

    if (results.length > 0) {
      console.log('✓ Column "push_token" already exists in users table');
    } else {
      // Add the column
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN push_token VARCHAR(500) DEFAULT NULL
      `);
      console.log('✓ Successfully added "push_token" column to users table');
    }

    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding push_token column:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addPushTokenColumn();
