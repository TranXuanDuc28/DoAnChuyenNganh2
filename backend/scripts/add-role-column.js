/**
 * Script to add 'role' column to users table
 * Run this if you get "Unknown column 'role'" error
 */

require('dotenv').config();
const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function addRoleColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/002_add_role_to_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    console.log('Adding role column to users table...');
    
    // Check if column exists first
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
    `);

    if (results.length > 0) {
      console.log('✓ Column "role" already exists in users table');
    } else {
      // Add the column (without specifying position to avoid errors)
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'
      `);
      console.log('✓ Successfully added "role" column to users table');

      // Update existing users
      await sequelize.query(`
        UPDATE users SET role = 'user' WHERE role IS NULL
      `);
      console.log('✓ Updated existing users with default role');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now run: node scripts/create-admin.js <email> <password> <firstName> <lastName>');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding role column:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addRoleColumn();

