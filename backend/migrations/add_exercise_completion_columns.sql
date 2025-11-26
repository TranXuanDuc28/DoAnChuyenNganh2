-- Add is_completed and completed_at columns to workout_plan_day_exercises table
ALTER TABLE workout_plan_day_exercises 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN completed_at TIMESTAMP NULL;

-- Add comment to columns
COMMENT ON COLUMN workout_plan_day_exercises.is_completed IS 'Whether this exercise has been completed';
COMMENT ON COLUMN workout_plan_day_exercises.completed_at IS 'Timestamp when the exercise was completed';
