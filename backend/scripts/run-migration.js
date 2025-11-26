const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fitness_app',
      multipleStatements: true
    });

    console.log('Connected successfully!');
    console.log('Running migration: 004_fix_exercise_categories_columns.sql');

    const migrationPath = path.join(__dirname, '../migrations/004_fix_exercise_categories_columns.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await connection.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('\nChecking table structure...');

    const [rows] = await connection.query('DESCRIBE exercise_categories');
    
    console.log('\nCurrent columns in exercise_categories:');
    rows.forEach(row => {
      console.log(`  - ${row.Field} (${row.Type})`);
    });

    console.log('\n✅ All done! You can now restart your backend server.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();

