-- Migration: Add role column to users table
-- This migration adds the 'role' column to support admin functionality
-- Note: MySQL doesn't support "IF NOT EXISTS" for ALTER TABLE ADD COLUMN
-- Use the script add-role-column.js which checks if column exists first

USE fitness_app;

-- Add role column (run only if column doesn't exist - use script to check)
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' 
AFTER onboardingCompleted;

-- Update existing users to have 'user' role
UPDATE users SET role = 'user' WHERE role IS NULL;

