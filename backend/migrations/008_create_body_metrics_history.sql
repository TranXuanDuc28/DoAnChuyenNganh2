-- Migration: Create Body Metrics History Table
-- Description: Create table to track user body metrics over time
-- Date: 2025-11-27

CREATE TABLE IF NOT EXISTS `body_metrics_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `weight` float NOT NULL COMMENT 'Weight in kg',
  `height` float DEFAULT NULL COMMENT 'Height in cm',
  `waist_circumference` float DEFAULT NULL COMMENT 'Waist circumference in cm',
  `hip_circumference` float DEFAULT NULL COMMENT 'Hip circumference in cm',
  `body_fat_percentage` float DEFAULT NULL COMMENT 'Body fat percentage',
  `muscle_mass` float DEFAULT NULL COMMENT 'Muscle mass in kg',
  `bmi` float DEFAULT NULL COMMENT 'Body Mass Index',
  `whr` float DEFAULT NULL COMMENT 'Waist-to-Hip Ratio',
  `notes` text DEFAULT NULL COMMENT 'Additional notes about this measurement',
  `recorded_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'When this measurement was taken',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_recorded` (`user_id`,`recorded_at`),
  KEY `idx_user_created` (`user_id`,`created_at`),
  CONSTRAINT `body_metrics_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



