-- Migration: Remove unused fields from users table
-- Date: 2025-11-25
-- Description: Remove fields that are not needed for the application

-- Remove health metrics fields
ALTER TABLE users DROP COLUMN IF EXISTS muscle_mass;
ALTER TABLE users DROP COLUMN IF EXISTS resting_heart_rate;
ALTER TABLE users DROP COLUMN IF EXISTS blood_pressure_systolic;
ALTER TABLE users DROP COLUMN IF EXISTS blood_pressure_diastolic;
ALTER TABLE users DROP COLUMN IF EXISTS health_metrics_last_updated;

-- Remove preferences fields
ALTER TABLE users DROP COLUMN IF EXISTS units;
ALTER TABLE users DROP COLUMN IF EXISTS workout_reminders;
ALTER TABLE users DROP COLUMN IF EXISTS nutrition_reminders;
ALTER TABLE users DROP COLUMN IF EXISTS progress_updates;
ALTER TABLE users DROP COLUMN IF EXISTS social_updates;
ALTER TABLE users DROP COLUMN IF EXISTS profile_visibility;
ALTER TABLE users DROP COLUMN IF EXISTS share_progress;

-- Remove integrations fields
ALTER TABLE users DROP COLUMN IF EXISTS apple_health_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS apple_health_connected_at;
ALTER TABLE users DROP COLUMN IF EXISTS google_fit_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS google_fit_connected_at;
ALTER TABLE users DROP COLUMN IF EXISTS fitbit_enabled;
ALTER TABLE users DROP COLUMN IF EXISTS fitbit_connected_at;
ALTER TABLE users DROP COLUMN IF EXISTS wearables;

-- Remove social fields
ALTER TABLE users DROP COLUMN IF EXISTS friends;
ALTER TABLE users DROP COLUMN IF EXISTS friend_requests;
ALTER TABLE users DROP COLUMN IF EXISTS achievements;
ALTER TABLE users DROP COLUMN IF EXISTS workout_streak;

-- Remove subscription fields
ALTER TABLE users DROP COLUMN IF EXISTS subscription_plan;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_start_date;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_end_date;

-- Remove push notification field
ALTER TABLE users DROP COLUMN IF EXISTS push_token;

