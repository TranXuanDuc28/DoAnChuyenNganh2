-- Migration: Add workout_duration column to users table
-- Description: Add workout_duration field to store user's preferred workout duration per session

-- Add workout_duration column
ALTER TABLE users 
ADD COLUMN workout_duration INT DEFAULT 60 
COMMENT 'Workout duration in minutes per session';

-- Add check constraint to ensure valid duration (15-180 minutes)
ALTER TABLE users 
ADD CONSTRAINT check_workout_duration 
CHECK (workout_duration >= 60 AND workout_duration <= 180);

-- Update existing users to have default value
UPDATE users 
SET workout_duration = 90 
WHERE workout_duration IS NULL;

