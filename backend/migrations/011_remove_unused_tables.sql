-- ============================================================================
-- Migration: 011 - Remove Unused Tables
-- Description: Xóa 18 bảng không được sử dụng trong codebase
-- Date: 2025-11-27
-- Author: AI Assistant
-- 
-- QUAN TRỌNG: 
-- - BACKUP DATABASE trước khi chạy migration này!
-- - Không thể hoàn tác sau khi xóa
-- - Xóa theo đúng thứ tự để tránh lỗi foreign key
-- ============================================================================

USE fitness_appp;

-- Tắt foreign key checks tạm thời để xóa dễ dàng hơn
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- BƯỚC 1: Xóa các bảng con (có foreign key dependencies)
-- ============================================================================

-- 1.1. Xóa workout_sessions (phụ thuộc vào workouts)
DROP TABLE IF EXISTS `workout_sessions`;
-- Lý do: Không có model WorkoutSession trong codebase

-- 1.2. Xóa nutrition_entries (phụ thuộc vào foods và meals)
DROP TABLE IF EXISTS `nutrition_entries`;
-- Lý do: Model đã bị xóa khỏi Nutrition.js

-- ============================================================================
-- BƯỚC 2: Xóa các bảng cha (được tham chiếu bởi bảng con)
-- ============================================================================

-- 2.1. Xóa workouts
DROP TABLE IF EXISTS `workouts`;
-- Lý do: Không có model Workout trong codebase, chỉ có WorkoutPlan

-- 2.2. Xóa foods
DROP TABLE IF EXISTS `foods`;
-- Lý do: Model Food đã bị xóa khỏi Nutrition.js

-- 2.3. Xóa meals
DROP TABLE IF EXISTS `meals`;
-- Lý do: Model Meal đã bị xóa khỏi Nutrition.js

-- ============================================================================
-- BƯỚC 3: Xóa các bảng Health không sử dụng (độc lập)
-- ============================================================================

-- 3.1. Xóa sleep_records
DROP TABLE IF EXISTS `sleep_records`;
-- Lý do: Model SleepRecord đã bị xóa khỏi Health.js

-- 3.2. Xóa heart_rate_records
DROP TABLE IF EXISTS `heart_rate_records`;
-- Lý do: Model HeartRateRecord đã bị xóa khỏi Health.js

-- 3.3. Xóa stress_records
DROP TABLE IF EXISTS `stress_records`;
-- Lý do: Model StressRecord đã bị xóa khỏi Health.js

-- 3.4. Xóa blood_pressure_records
DROP TABLE IF EXISTS `blood_pressure_records`;
-- Lý do: Model BloodPressureRecord đã bị xóa khỏi Health.js

-- 3.5. Xóa menstrual_cycles
DROP TABLE IF EXISTS `menstrual_cycles`;
-- Lý do: Model MenstrualCycle đã bị xóa khỏi Health.js

-- 3.6. Xóa weight_records
DROP TABLE IF EXISTS `weight_records`;
-- Lý do: Model WeightRecord đã bị xóa khỏi Health.js
-- Lưu ý: Đã có body_metrics_history thay thế

-- 3.7. Xóa activity_records
DROP TABLE IF EXISTS `activity_records`;
-- Lý do: Model ActivityRecord đã bị xóa khỏi Health.js

-- 3.8. Xóa breathing_exercises
DROP TABLE IF EXISTS `breathing_exercises`;
-- Lý do: Model BreathingExercise đã bị xóa khỏi Health.js

-- 3.9. Xóa health_goals
DROP TABLE IF EXISTS `health_goals`;
-- Lý do: Model HealthGoal đã bị xóa khỏi Health.js

-- ============================================================================
-- BƯỚC 4: Xóa các bảng Nutrition không sử dụng (độc lập)
-- ============================================================================

-- 4.1. Xóa nutrition_goals
DROP TABLE IF EXISTS `nutrition_goals`;
-- Lý do: Model NutritionGoal đã bị xóa khỏi Nutrition.js

-- 4.2. Xóa water_intakes
DROP TABLE IF EXISTS `water_intakes`;
-- Lý do: Model WaterIntake đã bị xóa khỏi Nutrition.js

-- ============================================================================
-- BƯỚC 5: Xóa các bảng hệ thống không sử dụng
-- ============================================================================

-- 5.1. Xóa notifications
DROP TABLE IF EXISTS `notifications`;
-- Lý do: File Notification.js rỗng, không có model

-- 5.2. Xóa system_settings
DROP TABLE IF EXISTS `system_settings`;
-- Lý do: File SystemSettings.js rỗng, không có model

-- ============================================================================
-- Bật lại foreign key checks
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- HOÀN THÀNH
-- ============================================================================

-- Đã xóa 18 bảng không sử dụng:
-- 1. workout_sessions
-- 2. nutrition_entries
-- 3. workouts
-- 4. foods
-- 5. meals
-- 6. sleep_records
-- 7. heart_rate_records
-- 8. stress_records
-- 9. blood_pressure_records
-- 10. menstrual_cycles
-- 11. weight_records
-- 12. activity_records
-- 13. breathing_exercises
-- 14. health_goals
-- 15. nutrition_goals
-- 16. water_intakes
-- 17. notifications
-- 18. system_settings

-- Kiểm tra các bảng còn lại:
-- SHOW TABLES;

-- Kết quả mong đợi (13 bảng):
-- - users
-- - exercises
-- - exercise_categories
-- - exercise_category_mappings
-- - workout_plans
-- - workout_plan_days
-- - workout_plan_day_exercises
-- - meal_plans
-- - ai_suggestions
-- - body_metrics_history
-- - image_evaluations
-- - video_analyses
-- - pose_logs



