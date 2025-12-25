-- Migration: Create meal_completions table
-- Purpose: Track when users complete meals from their meal plans
-- Created: 2025-12-25

CREATE TABLE IF NOT EXISTS `meal_completions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `meal_plan_id` INT(11) NOT NULL,
  `meal_id` VARCHAR(255) NOT NULL COMMENT 'Format: dayNumber-mealType (e.g., "1-breakfast")',
  `completed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_meal` (`user_id`, `meal_plan_id`, `meal_id`),
  KEY `idx_user_meal_plan` (`user_id`, `meal_plan_id`),
  KEY `idx_completed_at` (`completed_at`),
  CONSTRAINT `meal_completions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meal_completions_meal_plan_fk` FOREIGN KEY (`meal_plan_id`) REFERENCES `meal_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
