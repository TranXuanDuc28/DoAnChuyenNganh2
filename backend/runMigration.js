const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'fitness_appp',
            multipleStatements: true
        });

        console.log('Connected to MySQL database');

        // Read SQL file
        const sqlFile = path.join(__dirname, 'migrations', 'create_pose_exercises.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        console.log('Executing migration...');

        // Execute SQL
        await connection.query(sql);

        console.log('✅ Migration completed successfully!');
        console.log('✅ pose_exercises table created');
        console.log('✅ 13 exercises inserted');

        await connection.end();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
