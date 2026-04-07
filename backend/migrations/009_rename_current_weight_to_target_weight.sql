-- Migration: Rename current_weight to target_weight
-- Description: Update existing database to rename current_weight column to target_weight
-- Date: 2025-11-27

USE fitness_app;

-- Check if current_weight exists and target_weight doesn't exist
-- If current_weight exists, rename it to target_weight
ALTER TABLE `users` 
CHANGE COLUMN `current_weight` `target_weight` FLOAT NULL COMMENT 'Target weight in kg';

-- If the above fails because target_weight already exists, you can run:
-- ALTER TABLE `users` DROP COLUMN IF EXISTS `current_weight`;



