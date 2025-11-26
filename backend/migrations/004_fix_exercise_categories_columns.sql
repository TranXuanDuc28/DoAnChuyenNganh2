USE fitness_app;

-- Rename columns from camelCase to snake_case if they exist
-- This migration fixes the column names to match Sequelize's underscored: true setting

-- Check if old columns exist and rename them
SET @dbname = DATABASE();
SET @tablename = 'exercise_categories';

-- Rename englishName to english_name
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'englishName'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercise_categories CHANGE COLUMN englishName english_name VARCHAR(255)', 
    'SELECT "Column englishName does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename imageUrl to image_url
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'imageUrl'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercise_categories CHANGE COLUMN imageUrl image_url VARCHAR(512)', 
    'SELECT "Column imageUrl does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename imageKey to image_key
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'imageKey'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercise_categories CHANGE COLUMN imageKey image_key VARCHAR(255)', 
    'SELECT "Column imageKey does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename backgroundColor to background_color
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'backgroundColor'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercise_categories CHANGE COLUMN backgroundColor background_color VARCHAR(32)', 
    'SELECT "Column backgroundColor does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename displayOrder to display_order
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'displayOrder'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercise_categories CHANGE COLUMN displayOrder display_order INT DEFAULT 0', 
    'SELECT "Column displayOrder does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename isActive to is_active
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'isActive'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercise_categories CHANGE COLUMN isActive is_active BOOLEAN DEFAULT TRUE', 
    'SELECT "Column isActive does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Fix foreign key column in exercises table
SET @tablename = 'exercises';

-- Rename exerciseCategoryId to exercise_category_id
SET @columnexists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = @tablename 
    AND COLUMN_NAME = 'exerciseCategoryId'
);

SET @query = IF(@columnexists > 0, 
    'ALTER TABLE exercises CHANGE COLUMN exerciseCategoryId exercise_category_id INT NULL', 
    'SELECT "Column exerciseCategoryId does not exist" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration completed: exercise_categories columns renamed to snake_case' AS status;

