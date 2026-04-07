-- Migration: Update User Health Metrics
-- Description: Rename current_weight to target_weight and add new health metric fields
-- Date: 2025-11-27

-- Add new columns
ALTER TABLE `users` 
ADD COLUMN `target_weight` FLOAT NULL COMMENT 'Target weight in kg' AFTER `body_fat_percentage`,
ADD COLUMN `waist_circumference` FLOAT NULL COMMENT 'Waist circumference in cm' AFTER `target_weight`,
ADD COLUMN `hip_circumference` FLOAT NULL COMMENT 'Hip circumference in cm' AFTER `waist_circumference`,
ADD COLUMN `muscle_mass` FLOAT NULL COMMENT 'Muscle mass in kg' AFTER `hip_circumference`,
ADD COLUMN `bmi` FLOAT NULL COMMENT 'Body Mass Index (auto-calculated)' AFTER `muscle_mass`,
ADD COLUMN `whr` FLOAT NULL COMMENT 'Waist-to-Hip Ratio (auto-calculated)' AFTER `bmi`;

-- Copy data from current_weight to target_weight if current_weight exists
UPDATE `users` SET `target_weight` = `current_weight` WHERE `current_weight` IS NOT NULL;

-- Drop old current_weight column
ALTER TABLE `users` DROP COLUMN IF EXISTS `current_weight`;

-- Calculate and populate BMI for existing users
UPDATE `users` 
SET `bmi` = `weight` / POWER((`height` / 100), 2)
WHERE `height` > 0 AND `weight` > 0;

-- Calculate and populate WHR for existing users
UPDATE `users` 
SET `whr` = `waist_circumference` / `hip_circumference`
WHERE `waist_circumference` > 0 AND `hip_circumference` > 0;



