-- Migration: Remove remaining unused fields from users table
-- Date: 2025-11-25
-- Description: Remove the remaining fields that were missed in previous migration

-- Remove remaining health metrics
ALTER TABLE users DROP COLUMN IF EXISTS muscle_mass;

-- Remove remaining preferences
ALTER TABLE users DROP COLUMN IF EXISTS units;

-- Remove remaining integrations
ALTER TABLE users DROP COLUMN IF EXISTS apple_health_enabled;

-- Remove remaining social
ALTER TABLE users DROP COLUMN IF EXISTS friends;

-- Remove remaining subscription
ALTER TABLE users DROP COLUMN IF EXISTS subscription_plan;

-- Remove remaining push notification
ALTER TABLE users DROP COLUMN IF EXISTS push_token;

