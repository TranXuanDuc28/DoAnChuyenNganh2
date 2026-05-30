-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fitness_appp
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_suggestions`
--

DROP TABLE IF EXISTS `ai_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_suggestions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('workout','nutrition','rest','mindfulness','general') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `related_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'e.g., workoutId, mealId, or specific metrics' CHECK (json_valid(`related_data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `is_actioned` tinyint(1) DEFAULT 0 COMMENT 'e.g., user started the suggested workout',
  `generated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ai_suggestions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `body_metrics_history`
--

DROP TABLE IF EXISTS `body_metrics_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `body_metrics_history` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercise_categories`
--

DROP TABLE IF EXISTS `exercise_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `english_name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  `image_key` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `background_color` varchar(32) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercise_category_mappings`
--

DROP TABLE IF EXISTS `exercise_category_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercise_category_mappings` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `category_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  PRIMARY KEY (`category_id`,`exercise_id`),
  UNIQUE KEY `unique_exercise_category` (`exercise_id`,`category_id`),
  CONSTRAINT `exercise_category_mappings_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `exercise_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exercise_category_mappings_ibfk_2` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('cardio','strength','flexibility','balance','sports') NOT NULL,
  `exercise_category_id` int(11) DEFAULT NULL,
  `muscle_groups` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of muscle groups' CHECK (json_valid(`muscle_groups`)),
  `equipment` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of equipment needed' CHECK (json_valid(`equipment`)),
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `instructions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of instruction steps' CHECK (json_valid(`instructions`)),
  `tips` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of tips' CHECK (json_valid(`tips`)),
  `video_url` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Duration in minutes',
  `calories_per_minute` float DEFAULT NULL,
  `is_custom` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_exercises_exercise_category` (`exercise_category_id`),
  CONSTRAINT `exercises_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_exercises_exercise_category` FOREIGN KEY (`exercise_category_id`) REFERENCES `exercise_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `image_evaluations`
--

DROP TABLE IF EXISTS `image_evaluations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_evaluations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `exercise_name` varchar(255) NOT NULL COMMENT 'Tên bài tập (vrukshasana, squat, etc.)',
  `score` float NOT NULL DEFAULT 0 COMMENT 'Điểm đánh giá (0-100)',
  `is_correct` tinyint(1) DEFAULT 0 COMMENT 'Tư thế có đúng không',
  `feedback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Mảng các gợi ý cải thiện' CHECK (json_valid(`feedback`)),
  `input_image_path` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh input gốc',
  `result_image_path` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh kết quả (có skeleton)',
  `reference_image_path` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh tham chiếu',
  `comparison_image_path` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh so sánh',
  `keypoints` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Keypoints được phát hiện' CHECK (json_valid(`keypoints`)),
  `angles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Các góc đo được' CHECK (json_valid(`angles`)),
  `detected_pose` varchar(255) DEFAULT NULL COMMENT 'Tư thế được tự động nhận diện (nếu có)',
  `confidence` float DEFAULT NULL COMMENT 'Độ tin cậy của nhận diện tự động (0-1)',
  `processing_time` float DEFAULT NULL COMMENT 'Thời gian xử lý (giây)',
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Thông tin bổ sung' CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `image_evaluations_user_id` (`user_id`),
  KEY `image_evaluations_exercise_name` (`exercise_name`),
  KEY `image_evaluations_created_at` (`created_at`),
  KEY `image_evaluations_status` (`status`),
  CONSTRAINT `image_evaluations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `meal_plans`
--

DROP TABLE IF EXISTS `meal_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meal_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in days',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `meals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of meals for each day' CHECK (json_valid(`meals`)),
  `total_calories` int(11) DEFAULT NULL,
  `macronutrients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Total macronutrients for the plan' CHECK (json_valid(`macronutrients`)),
  `dietary_restrictions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of dietary restrictions' CHECK (json_valid(`dietary_restrictions`)),
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'User preferences' CHECK (json_valid(`preferences`)),
  `is_active` tinyint(1) DEFAULT 1,
  `ai_generated` tinyint(1) DEFAULT 0,
  `ai_prompt` text DEFAULT NULL COMMENT 'AI prompt used to generate this plan',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `meal_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pose_logs`
--

DROP TABLE IF EXISTS `pose_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pose_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `exercise_name` varchar(255) NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `score` float DEFAULT NULL,
  `rep_count` int(11) DEFAULT NULL,
  `angles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`angles`)),
  `keypoints` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keypoints`)),
  `raw_image_stored` tinyint(1) DEFAULT 0 COMMENT 'If original image was stored externally (not in DB)',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pose_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `height` float NOT NULL COMMENT 'Height in cm',
  `weight` float NOT NULL COMMENT 'Weight in kg',
  `fitness_level` enum('beginner','intermediate','advanced') NOT NULL,
  `fitness_goals` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of fitness goals' CHECK (json_valid(`fitness_goals`)),
  `activity_level` enum('sedentary','lightly_active','moderately_active','very_active','extremely_active') DEFAULT 'moderately_active',
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `target_weight` float DEFAULT NULL,
  `body_fat_percentage` float DEFAULT NULL,
  `nutrition_streak` int(11) DEFAULT 0,
  `sleep_streak` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `onboarding_completed` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `budget_level` enum('low','medium','high') DEFAULT 'medium' COMMENT 'Budget level for meal planning',
  `food_preferences` longtext DEFAULT NULL COMMENT 'JSON array of food preferences (e.g., healthy, high-protein)',
  `food_allergies` longtext DEFAULT NULL COMMENT 'JSON array of food allergies (e.g., seafood, dairy)',
  `daily_meals` int(11) DEFAULT 3 COMMENT 'Number of meals per day',
  `workout_duration` int(11) DEFAULT 60 COMMENT 'Workout duration in minutes per session',
  `waist_circumference` float DEFAULT NULL COMMENT 'Waist circumference in cm',
  `hip_circumference` float DEFAULT NULL COMMENT 'Hip circumference in cm',
  `bmi` float DEFAULT NULL COMMENT 'Body Mass Index',
  `whr` float DEFAULT NULL COMMENT 'Waist-to-Hip Ratio',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `users_email_unique` (`email`),
  CONSTRAINT `check_workout_duration` CHECK (`workout_duration` >= 60 and `workout_duration` <= 180)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `video_analyses`
--

DROP TABLE IF EXISTS `video_analyses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video_analyses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `exercise_name` varchar(255) NOT NULL COMMENT 'Tên động tác được nhận diện (squat, push_up, etc.)',
  `repetition_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Số lần lặp lại động tác',
  `input_video_path` varchar(255) NOT NULL COMMENT 'Đường dẫn đến video input gốc',
  `output_video_path` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn đến video output đã được xử lý (có skeleton overlay)',
  `video_url` varchar(255) DEFAULT NULL COMMENT 'URL công khai để truy cập video output (nếu được lưu trên cloud storage)',
  `duration` int(11) DEFAULT NULL COMMENT 'Thời lượng video (giây)',
  `fps` int(11) DEFAULT NULL COMMENT 'FPS của video',
  `resolution` varchar(255) DEFAULT NULL COMMENT 'Độ phân giải video (ví dụ: "1280x720")',
  `processing_time` float DEFAULT NULL COMMENT 'Thời gian xử lý (giây)',
  `status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  `error_message` text DEFAULT NULL COMMENT 'Thông báo lỗi nếu xử lý thất bại',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Thông tin bổ sung (thresholds, confidence scores, etc.)' CHECK (json_valid(`metadata`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `video_analyses_user_id` (`user_id`),
  KEY `video_analyses_exercise_name` (`exercise_name`),
  KEY `video_analyses_status` (`status`),
  KEY `video_analyses_created_at` (`created_at`),
  CONSTRAINT `video_analyses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workout_plan_day_exercises`
--

DROP TABLE IF EXISTS `workout_plan_day_exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_plan_day_exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workout_plan_day_id` int(11) NOT NULL,
  `exercise_id` int(11) NOT NULL,
  `order_index` int(11) NOT NULL COMMENT 'Order of exercise in the day',
  `sets` int(11) DEFAULT 3,
  `reps` varchar(50) DEFAULT NULL COMMENT 'e.g., "10-12", "15", "AMRAP"',
  `duration` int(11) DEFAULT NULL COMMENT 'Duration in seconds for time-based exercises',
  `rest_seconds` int(11) DEFAULT 60 COMMENT 'Rest time between sets in seconds',
  `weight` varchar(50) DEFAULT NULL COMMENT 'Weight to use, e.g., "bodyweight", "10kg", "moderate"',
  `notes` text DEFAULT NULL COMMENT 'Additional notes for this exercise',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wpde_uniq` (`workout_plan_day_id`,`exercise_id`),
  KEY `wpde_order` (`workout_plan_day_id`,`order_index`),
  KEY `wpde_ex_idx` (`exercise_id`),
  CONSTRAINT `wpde_day_fk` FOREIGN KEY (`workout_plan_day_id`) REFERENCES `workout_plan_days` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wpde_ex_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=308 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workout_plan_days`
--

DROP TABLE IF EXISTS `workout_plan_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_plan_days` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workout_plan_id` int(11) DEFAULT NULL,
  `day_number` int(11) NOT NULL COMMENT 'Day number in the plan (1, 2, 3, ...)',
  `day_name` varchar(255) DEFAULT NULL COMMENT 'E.g., "Day 1 - Chest & Triceps"',
  `focus_area` varchar(255) DEFAULT NULL COMMENT 'E.g., "Upper Body", "Cardio", "Legs"',
  `exercises` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of exercise objects with exerciseId, sets, reps, duration, rest' CHECK (json_valid(`exercises`)),
  `total_duration` int(11) DEFAULT NULL COMMENT 'Total duration in minutes',
  `estimated_calories` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL COMMENT 'Additional notes or tips for this day',
  `is_rest_day` tinyint(1) DEFAULT 0,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workout_plan_id` (`workout_plan_id`),
  CONSTRAINT `workout_plan_days_ibfk_1` FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workout_plans`
--

DROP TABLE IF EXISTS `workout_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workout_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `goal` enum('weight_loss','muscle_gain','endurance','strength','flexibility','general_fitness') NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in weeks',
  `frequency` int(11) NOT NULL COMMENT 'Workouts per week',
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Weekly schedule' CHECK (json_valid(`schedule`)),
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `progress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Progress tracking data' CHECK (json_valid(`progress`)),
  `ai_generated` tinyint(1) DEFAULT 0,
  `ai_prompt` text DEFAULT NULL COMMENT 'AI prompt used to generate this plan',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `workout_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-27 22:28:16
