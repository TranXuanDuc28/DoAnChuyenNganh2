-- Script to fix video_analyses table: rename user_id to user_id
-- Run this script if migration doesn't work automatically

USE fitness_app; -- Change to your database name if different

-- Step 1: Drop foreign key constraint if exists
SET @constraint_name = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'video_analyses' 
  AND COLUMN_NAME = 'user_id'
  AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
  CONCAT('ALTER TABLE video_analyses DROP FOREIGN KEY ', @constraint_name), 
  'SELECT "No foreign key constraint found" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Rename column from user_id to user_id
ALTER TABLE video_analyses 
CHANGE COLUMN user_id user_id INT NOT NULL;

-- Step 3: Re-add foreign key constraint
ALTER TABLE video_analyses 
ADD CONSTRAINT fk_video_analyses_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 4: Add index (ignore error if already exists)
-- Note: If index already exists, this will show an error but won't break the script
CREATE INDEX video_analyses_user_id ON video_analyses(user_id);

SELECT 'Migration completed successfully!' as message;

