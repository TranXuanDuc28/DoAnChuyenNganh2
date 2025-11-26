/**
 * Script to manually fix video_analyses table column name
 * Run this script if migration doesn't work automatically:
 * node scripts/fix-video-analyses-column.js
 */

const { sequelize } = require('../config/database');
require('../models/VideoAnalysis'); // Import model to register it

const fixVideoAnalysesColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check if table exists
    const [tableCheck] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'video_analyses'
    `);

    if (tableCheck[0].count === 0) {
      console.log('video_analyses table does not exist. Creating...');
      await sequelize.sync({ alter: false });
      console.log('Table created successfully');
      process.exit(0);
    }

    // Check current column names
    const [columnCheck] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'video_analyses' 
      AND COLUMN_NAME = 'user_id'
    `);

    const [columnCheckCamel] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'video_analyses' 
      AND COLUMN_NAME = 'user_id'
    `);

    console.log('Current state:');
    console.log(`  - user_id column exists: ${columnCheck[0].count > 0}`);
    console.log(`  - user_id column exists: ${columnCheckCamel[0].count > 0}`);

    if (columnCheck[0].count > 0) {
      console.log('✓ Column user_id already exists. No migration needed.');
      process.exit(0);
    }

    if (columnCheckCamel[0].count === 0) {
      console.log('Neither user_id nor user_id column exists. Creating user_id...');
      
      // Check if table has data
      const [rowCount] = await sequelize.query(`
        SELECT COUNT(*) as count FROM video_analyses
      `);
      const hasData = rowCount[0].count > 0;

      if (hasData) {
        console.log('⚠ Table has existing data without user_id. Cleaning up...');
        await sequelize.query(`DELETE FROM video_analyses`);
      }

      await sequelize.query(`
        ALTER TABLE video_analyses 
        ADD COLUMN user_id INT NOT NULL AFTER id
      `);
      console.log('✓ Added user_id column');
    } else {
      console.log('Renaming user_id to user_id...');

      // Drop foreign key constraints
      const [constraints] = await sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'video_analyses' 
        AND COLUMN_NAME = 'user_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      for (const constraint of constraints) {
        try {
          await sequelize.query(`
            ALTER TABLE video_analyses 
            DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
          `);
          console.log(`✓ Dropped foreign key: ${constraint.CONSTRAINT_NAME}`);
        } catch (dropError) {
          console.warn(`⚠ Could not drop constraint ${constraint.CONSTRAINT_NAME}:`, dropError.message);
        }
      }

      // Rename column
      await sequelize.query(`
        ALTER TABLE video_analyses 
        CHANGE COLUMN user_id user_id INT NOT NULL
      `);
      console.log('✓ Renamed user_id to user_id');

      // Re-add foreign key
      try {
        await sequelize.query(`
          ALTER TABLE video_analyses 
          ADD CONSTRAINT fk_video_analyses_user 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✓ Re-added foreign key constraint');
      } catch (fkError) {
        if (!fkError.message.includes('Duplicate key name') && !fkError.message.includes('already exists')) {
          console.warn('⚠ Could not add foreign key:', fkError.message);
        } else {
          console.log('✓ Foreign key already exists');
        }
      }
    }

    // Add index
    try {
      await sequelize.query(`
        CREATE INDEX video_analyses_user_id ON video_analyses(user_id)
      `);
      console.log('✓ Added index on user_id');
    } catch (indexError) {
      if (!indexError.message.includes('Duplicate key name')) {
        console.warn('⚠ Could not create index:', indexError.message);
      } else {
        console.log('✓ Index already exists');
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixVideoAnalysesColumn();

