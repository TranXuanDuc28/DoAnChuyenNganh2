# 🗑️ Migration 011: Xóa 18 bảng không sử dụng

**Ngày:** 2025-11-27  
**Trạng thái:** ⚠️ CHƯA CHẠY - Cần backup trước

---

## 📊 Tổng quan

| Metric | Trước | Sau | Giảm |
|--------|-------|-----|------|
| **Tổng số bảng** | 31 | 13 | -18 (58.1%) |
| **Bảng được dùng** | 13 | 13 | 0 |
| **Bảng không dùng** | 18 | 0 | -18 (100%) |

---

## ❌ 18 bảng sẽ bị xóa

### Workout (2)
1. `workout_sessions`
2. `workouts`

### Nutrition (5)
3. `nutrition_entries`
4. `foods`
5. `meals`
6. `nutrition_goals`
7. `water_intakes`

### Health (9)
8. `sleep_records`
9. `heart_rate_records`
10. `stress_records`
11. `blood_pressure_records`
12. `menstrual_cycles`
13. `weight_records`
14. `activity_records`
15. `breathing_exercises`
16. `health_goals`

### System (2)
17. `notifications`
18. `system_settings`

---

## ✅ 13 bảng sẽ giữ lại

1. `users`
2. `exercises`
3. `exercise_categories`
4. `exercise_category_mappings`
5. `workout_plans`
6. `workout_plan_days`
7. `workout_plan_day_exercises`
8. `meal_plans`
9. `ai_suggestions`
10. `body_metrics_history`
11. `image_evaluations`
12. `video_analyses`
13. `pose_logs`

---

## 🚀 Cách chạy (3 bước đơn giản)

### Bước 1: Backup database
```bash
cd backend/migrations
mysqldump -u root -p fitness_appp > backup_before_migration_011.sql
```

### Bước 2: Chạy migration
```bash
mysql -u root -p fitness_appp < 011_remove_unused_tables.sql
```

### Bước 3: Kiểm tra kết quả
```bash
mysql -u root -p fitness_appp -e "SHOW TABLES;"
```

**Kết quả mong đợi:** 13 bảng

---

## ⚠️ Lưu ý quan trọng

- ⚠️ **BACKUP DATABASE** trước khi chạy
- ⚠️ **KHÔNG THỂ HOÀN TÁC** sau khi xóa
- ⚠️ Tất cả dữ liệu trong 18 bảng sẽ **MẤT VĨNH VIỄN**

---

## 📚 Tài liệu chi tiết

- **Migration file:** `backend/migrations/011_remove_unused_tables.sql`
- **Hướng dẫn chi tiết:** `backend/migrations/README_MIGRATION_011.md`
- **Phân tích đầy đủ:** `UNUSED_TABLES_ANALYSIS.md`

---

## 🎯 Lợi ích

✅ Giảm 58% số lượng bảng  
✅ Tăng performance  
✅ Dễ bảo trì hơn  
✅ Code sạch hơn  
✅ Giảm confusion cho developers  

---

## 🔄 Rollback (nếu cần)

```bash
# Drop database hiện tại
mysql -u root -p -e "DROP DATABASE fitness_appp;"

# Tạo lại database
mysql -u root -p -e "CREATE DATABASE fitness_appp;"

# Restore từ backup
mysql -u root -p fitness_appp < backup_before_migration_011.sql
```

---

**Tạo bởi:** AI Assistant  
**Ngày:** 2025-11-27



