-- ============================================================================
-- Verification Script for Migration 011
-- Description: Kiểm tra database trước và sau khi chạy migration
-- ============================================================================

USE fitness_appp;

-- ============================================================================
-- 1. KIỂM TRA TỔNG SỐ BẢNG
-- ============================================================================

SELECT 
    'Total Tables' as Check_Type,
    COUNT(*) as Count,
    CASE 
        WHEN COUNT(*) = 31 THEN '⚠️ TRƯỚC MIGRATION (31 bảng)'
        WHEN COUNT(*) = 13 THEN '✅ SAU MIGRATION (13 bảng)'
        ELSE '❌ LỖI: Số bảng không đúng'
    END as Status
FROM information_schema.tables 
WHERE table_schema = 'fitness_appp';

-- ============================================================================
-- 2. LIỆT KÊ TẤT CẢ CÁC BẢNG HIỆN TẠI
-- ============================================================================

SELECT 
    TABLE_NAME as 'Bảng hiện có',
    TABLE_ROWS as 'Số dòng',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Kích thước (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'fitness_appp'
ORDER BY TABLE_NAME;

-- ============================================================================
-- 3. KIỂM TRA CÁC BẢNG CẦN XÓA (TRƯỚC MIGRATION)
-- ============================================================================

SELECT 
    'Tables to be deleted' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'workout_sessions') THEN '❌ workout_sessions'
        ELSE '✅ workout_sessions (đã xóa)'
    END as workout_sessions,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'workouts') THEN '❌ workouts'
        ELSE '✅ workouts (đã xóa)'
    END as workouts,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'nutrition_entries') THEN '❌ nutrition_entries'
        ELSE '✅ nutrition_entries (đã xóa)'
    END as nutrition_entries,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'foods') THEN '❌ foods'
        ELSE '✅ foods (đã xóa)'
    END as foods,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'meals') THEN '❌ meals'
        ELSE '✅ meals (đã xóa)'
    END as meals;

SELECT 
    'Health Tables' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'sleep_records') THEN '❌ sleep_records'
        ELSE '✅ sleep_records (đã xóa)'
    END as sleep_records,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'heart_rate_records') THEN '❌ heart_rate_records'
        ELSE '✅ heart_rate_records (đã xóa)'
    END as heart_rate_records,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'stress_records') THEN '❌ stress_records'
        ELSE '✅ stress_records (đã xóa)'
    END as stress_records,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'blood_pressure_records') THEN '❌ blood_pressure_records'
        ELSE '✅ blood_pressure_records (đã xóa)'
    END as blood_pressure_records,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'menstrual_cycles') THEN '❌ menstrual_cycles'
        ELSE '✅ menstrual_cycles (đã xóa)'
    END as menstrual_cycles;

SELECT 
    'More Health Tables' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'weight_records') THEN '❌ weight_records'
        ELSE '✅ weight_records (đã xóa)'
    END as weight_records,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'activity_records') THEN '❌ activity_records'
        ELSE '✅ activity_records (đã xóa)'
    END as activity_records,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'breathing_exercises') THEN '❌ breathing_exercises'
        ELSE '✅ breathing_exercises (đã xóa)'
    END as breathing_exercises,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'health_goals') THEN '❌ health_goals'
        ELSE '✅ health_goals (đã xóa)'
    END as health_goals;

SELECT 
    'Nutrition & System Tables' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'nutrition_goals') THEN '❌ nutrition_goals'
        ELSE '✅ nutrition_goals (đã xóa)'
    END as nutrition_goals,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'water_intakes') THEN '❌ water_intakes'
        ELSE '✅ water_intakes (đã xóa)'
    END as water_intakes,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'notifications') THEN '❌ notifications'
        ELSE '✅ notifications (đã xóa)'
    END as notifications,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'system_settings') THEN '❌ system_settings'
        ELSE '✅ system_settings (đã xóa)'
    END as system_settings;

-- ============================================================================
-- 4. KIỂM TRA CÁC BẢNG CẦN GIỮ LẠI (SAU MIGRATION)
-- ============================================================================

SELECT 
    'Tables to keep' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'users') THEN '✅ users'
        ELSE '❌ users (thiếu!)'
    END as users,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'exercises') THEN '✅ exercises'
        ELSE '❌ exercises (thiếu!)'
    END as exercises,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'exercise_categories') THEN '✅ exercise_categories'
        ELSE '❌ exercise_categories (thiếu!)'
    END as exercise_categories,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'workout_plans') THEN '✅ workout_plans'
        ELSE '❌ workout_plans (thiếu!)'
    END as workout_plans;

SELECT 
    'More Tables to keep' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'workout_plan_days') THEN '✅ workout_plan_days'
        ELSE '❌ workout_plan_days (thiếu!)'
    END as workout_plan_days,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'workout_plan_day_exercises') THEN '✅ workout_plan_day_exercises'
        ELSE '❌ workout_plan_day_exercises (thiếu!)'
    END as workout_plan_day_exercises,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'meal_plans') THEN '✅ meal_plans'
        ELSE '❌ meal_plans (thiếu!)'
    END as meal_plans,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'ai_suggestions') THEN '✅ ai_suggestions'
        ELSE '❌ ai_suggestions (thiếu!)'
    END as ai_suggestions;

SELECT 
    'Final Tables to keep' as Check_Type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'body_metrics_history') THEN '✅ body_metrics_history'
        ELSE '❌ body_metrics_history (thiếu!)'
    END as body_metrics_history,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'image_evaluations') THEN '✅ image_evaluations'
        ELSE '❌ image_evaluations (thiếu!)'
    END as image_evaluations,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'video_analyses') THEN '✅ video_analyses'
        ELSE '❌ video_analyses (thiếu!)'
    END as video_analyses,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'pose_logs') THEN '✅ pose_logs'
        ELSE '❌ pose_logs (thiếu!)'
    END as pose_logs,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'fitness_appp' AND table_name = 'exercise_category_mappings') THEN '✅ exercise_category_mappings'
        ELSE '❌ exercise_category_mappings (thiếu!)'
    END as exercise_category_mappings;

-- ============================================================================
-- 5. KIỂM TRA FOREIGN KEYS
-- ============================================================================

SELECT 
    'Foreign Keys Check' as Check_Type,
    COUNT(*) as Total_Foreign_Keys
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'fitness_appp'
AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT 
    TABLE_NAME as 'Bảng',
    COLUMN_NAME as 'Cột',
    CONSTRAINT_NAME as 'Constraint',
    REFERENCED_TABLE_NAME as 'Tham chiếu đến',
    REFERENCED_COLUMN_NAME as 'Cột tham chiếu'
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'fitness_appp'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- ============================================================================
-- 6. TỔNG KẾT
-- ============================================================================

SELECT 
    '=== MIGRATION STATUS ===' as Status,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'fitness_appp') = 31 
        THEN '⚠️ CHƯA CHẠY MIGRATION - Database còn 31 bảng'
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'fitness_appp') = 13 
        THEN '✅ ĐÃ CHẠY MIGRATION - Database còn 13 bảng'
        ELSE CONCAT('❌ LỖI - Database có ', 
                    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'fitness_appp'), 
                    ' bảng (không đúng)')
    END as Result;

-- ============================================================================
-- HƯỚNG DẪN SỬ DỤNG
-- ============================================================================

-- Chạy script này TRƯỚC migration để xem trạng thái hiện tại:
-- mysql -u root -p fitness_appp < verify_migration_011.sql > before_migration.txt

-- Chạy script này SAU migration để kiểm tra kết quả:
-- mysql -u root -p fitness_appp < verify_migration_011.sql > after_migration.txt

-- So sánh 2 files để xem sự khác biệt:
-- diff before_migration.txt after_migration.txt



