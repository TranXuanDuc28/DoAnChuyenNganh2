-- Migration: Remove unused tables
-- Created: 2025-11-27
-- Description: Remove tables that are not being used in the application

USE fitness_app;

-- ============================================
-- STEP 1: Remove foreign key constraints first
-- ============================================

-- Remove mealId foreign key from nutrition_entries
ALTER TABLE nutrition_entries 
DROP FOREIGN KEY IF EXISTS nutrition_entries_ibfk_3;

-- Remove mealId column from nutrition_entries
ALTER TABLE nutrition_entries 
DROP COLUMN IF EXISTS mealId;

-- ============================================
-- STEP 2: Drop unused tables
-- ============================================

-- Drop meals table (not used - meal_plans is used instead)
DROP TABLE IF EXISTS meals;

-- Drop blood_pressure_records table (not used - no routes or frontend implementation)
DROP TABLE IF EXISTS blood_pressure_records;

-- Drop menstrual_cycles table (not used - no routes or frontend implementation)
DROP TABLE IF EXISTS menstrual_cycles;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show remaining tables
SELECT 'Remaining tables after cleanup:' as Status;
SHOW TABLES;

-- ============================================
-- NOTES
-- ============================================

-- Tables removed:
-- 1. meals - Recipe/meal definitions (not used, meal_plans stores meals as JSON)
-- 2. blood_pressure_records - Blood pressure tracking (no implementation)
-- 3. menstrual_cycles - Menstrual cycle tracking (no implementation)

-- Tables kept (16 tables total):
-- - users
-- - exercises, workouts, workout_sessions, workout_plans
-- - foods, nutrition_entries, nutrition_goals, meal_plans, water_intakes
-- - sleep_records, heart_rate_records, stress_records, weight_records, activity_records, breathing_exercises, health_goals

-- If you need these tables in the future:
-- 1. Restore from migrations/001_create_database.sql
-- 2. Add corresponding routes in backend/routes/
-- 3. Add API calls in frontend/services/api.js
-- 4. Create UI components to use the features



