-- Migration 005: Add nutrition preferences to users table
-- Date: 2024-11-25

-- Add nutrition-related columns
ALTER TABLE users 
ADD COLUMN daily_meals INT DEFAULT 3 COMMENT 'Number of meals per day';

ALTER TABLE users 
ADD COLUMN budget_level ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Budget level for meal planning';

ALTER TABLE users 
ADD COLUMN food_preferences LONGTEXT COMMENT 'JSON array of food preferences (e.g., healthy, high-protein)';

ALTER TABLE users 
ADD COLUMN food_allergies LONGTEXT COMMENT 'JSON array of food allergies (e.g., seafood, dairy)';

