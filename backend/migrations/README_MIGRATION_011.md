# 🗑️ Migration 011: Xóa các bảng không sử dụng

**Ngày tạo:** 2025-11-27  
**Mục đích:** Xóa 18 bảng không được sử dụng trong codebase để tối ưu database

---

## ⚠️ CẢNH BÁO QUAN TRỌNG

### 🚨 Trước khi chạy migration này:

1. **BACKUP DATABASE BẮT BUỘC**
   ```bash
   # Backup toàn bộ database
   mysqldump -u root -p fitness_appp > backup_before_migration_011_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **KHÔNG THỂ HOÀN TÁC**
   - Migration này xóa vĩnh viễn 18 bảng
   - Tất cả dữ liệu trong các bảng đó sẽ mất
   - Không có rollback script

3. **KIỂM TRA LẠI**
   - Đảm bảo không có code nào đang sử dụng các bảng này
   - Đọc kỹ danh sách bảng sẽ bị xóa bên dưới

---

## 📋 Danh sách 18 bảng sẽ bị xóa

### Nhóm 1: Workout (2 bảng)
1. ❌ `workout_sessions` - Lịch sử buổi tập
2. ❌ `workouts` - Bài tập workout

### Nhóm 2: Nutrition (5 bảng)
3. ❌ `nutrition_entries` - Nhật ký dinh dưỡng
4. ❌ `foods` - Thông tin thực phẩm
5. ❌ `meals` - Công thức món ăn
6. ❌ `nutrition_goals` - Mục tiêu dinh dưỡng
7. ❌ `water_intakes` - Lượng nước uống

### Nhóm 3: Health (9 bảng)
8. ❌ `sleep_records` - Ghi chú giấc ngủ
9. ❌ `heart_rate_records` - Nhịp tim
10. ❌ `stress_records` - Mức độ stress
11. ❌ `blood_pressure_records` - Huyết áp
12. ❌ `menstrual_cycles` - Chu kỳ kinh nguyệt
13. ❌ `weight_records` - Cân nặng (đã có `body_metrics_history` thay thế)
14. ❌ `activity_records` - Hoạt động hàng ngày
15. ❌ `breathing_exercises` - Bài tập thở
16. ❌ `health_goals` - Mục tiêu sức khỏe

### Nhóm 4: System (2 bảng)
17. ❌ `notifications` - Thông báo
18. ❌ `system_settings` - Cài đặt hệ thống

---

## ✅ Các bảng SẼ GIỮ LẠI (13 bảng)

1. ✅ `users` - Người dùng
2. ✅ `exercises` - Bài tập
3. ✅ `exercise_categories` - Danh mục bài tập
4. ✅ `exercise_category_mappings` - Liên kết bài tập - danh mục
5. ✅ `workout_plans` - Kế hoạch tập luyện
6. ✅ `workout_plan_days` - Chi tiết ngày tập
7. ✅ `workout_plan_day_exercises` - Bài tập trong ngày
8. ✅ `meal_plans` - Kế hoạch dinh dưỡng
9. ✅ `ai_suggestions` - Gợi ý AI
10. ✅ `body_metrics_history` - Lịch sử chỉ số cơ thể
11. ✅ `image_evaluations` - Đánh giá ảnh tư thế
12. ✅ `video_analyses` - Phân tích video
13. ✅ `pose_logs` - Log tư thế

---

## 🚀 Cách chạy Migration

### Phương pháp 1: Sử dụng MySQL Command Line (Khuyến nghị)

```bash
# 1. Di chuyển đến thư mục migrations
cd backend/migrations

# 2. Backup database
mysqldump -u root -p fitness_appp > backup_before_migration_011.sql

# 3. Chạy migration
mysql -u root -p fitness_appp < 011_remove_unused_tables.sql

# 4. Kiểm tra kết quả
mysql -u root -p fitness_appp -e "SHOW TABLES;"
```

### Phương pháp 2: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối đến database `fitness_appp`
3. **File** → **Run SQL Script**
4. Chọn file `011_remove_unused_tables.sql`
5. Click **Run**
6. Kiểm tra output để đảm bảo không có lỗi

### Phương pháp 3: Sử dụng phpMyAdmin

1. Truy cập phpMyAdmin
2. Chọn database `fitness_appp`
3. Click tab **SQL**
4. Copy nội dung file `011_remove_unused_tables.sql`
5. Paste vào SQL editor
6. Click **Go**

---

## 🔍 Kiểm tra sau khi chạy Migration

### 1. Kiểm tra số lượng bảng

```sql
USE fitness_appp;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'fitness_appp';
```

**Kết quả mong đợi:** 13 bảng

### 2. Liệt kê các bảng còn lại

```sql
SHOW TABLES;
```

**Kết quả mong đợi:**
```
+----------------------------------+
| Tables_in_fitness_appp           |
+----------------------------------+
| ai_suggestions                   |
| body_metrics_history             |
| exercise_categories              |
| exercise_category_mappings       |
| exercises                        |
| image_evaluations                |
| meal_plans                       |
| pose_logs                        |
| users                            |
| video_analyses                   |
| workout_plan_day_exercises       |
| workout_plan_days                |
| workout_plans                    |
+----------------------------------+
```

### 3. Kiểm tra foreign keys

```sql
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'fitness_appp'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
```

**Đảm bảo:** Không có foreign key nào tham chiếu đến các bảng đã xóa

---

## 🧪 Test sau Migration

### 1. Test khởi động backend

```bash
cd backend
npm start
```

**Kiểm tra:** Backend khởi động không có lỗi Sequelize

### 2. Test API endpoints

```bash
# Test user endpoint
curl http://localhost:5000/api/users/profile

# Test workout plans endpoint
curl http://localhost:5000/api/workout-plans

# Test meal plans endpoint
curl http://localhost:5000/api/meal-plans
```

**Kiểm tra:** Tất cả endpoints hoạt động bình thường

### 3. Kiểm tra logs

```bash
# Xem logs của backend
tail -f backend/logs/app.log
```

**Kiểm tra:** Không có lỗi liên quan đến database

---

## 🔄 Rollback (Khôi phục)

### Nếu có vấn đề, khôi phục từ backup:

```bash
# 1. Dừng backend
# Ctrl+C hoặc kill process

# 2. Drop database hiện tại
mysql -u root -p -e "DROP DATABASE fitness_appp;"

# 3. Tạo lại database
mysql -u root -p -e "CREATE DATABASE fitness_appp;"

# 4. Restore từ backup
mysql -u root -p fitness_appp < backup_before_migration_011.sql

# 5. Khởi động lại backend
cd backend
npm start
```

---

## 📊 Lợi ích sau Migration

### ✅ Performance
- **Giảm kích thước database:** ~58% (từ 31 bảng xuống 13 bảng)
- **Tăng tốc độ query:** Ít bảng hơn = ít metadata hơn
- **Giảm memory footprint:** MySQL không cần cache metadata của 18 bảng

### ✅ Maintainability
- **Code sạch hơn:** Không còn bảng "ma" không dùng
- **Dễ hiểu hơn:** Chỉ còn những bảng thực sự được sử dụng
- **Dễ debug hơn:** Ít nơi cần kiểm tra khi có lỗi

### ✅ Security
- **Giảm attack surface:** Ít bảng = ít điểm tấn công tiềm năng
- **Dễ audit hơn:** Dễ dàng review quyền truy cập database

---

## 📝 Ghi chú

### Tại sao các bảng này không được sử dụng?

1. **Models đã bị xóa:** Các file `Health.js` và `Nutrition.js` đã được làm sạch, xóa bỏ các models không dùng

2. **Files rỗng:** `Notification.js` và `SystemSettings.js` là files rỗng, không có model nào

3. **Thiết kế thay đổi:** 
   - `weight_records` → thay bằng `body_metrics_history` (toàn diện hơn)
   - `workouts` → thay bằng `workout_plans` (có cấu trúc tốt hơn)

### Có thể khôi phục lại không?

**Có**, nhưng cần:
1. Restore từ backup
2. Thêm lại models vào code
3. Thêm lại routes và controllers
4. Thêm lại UI (nếu cần)

**Khuyến nghị:** Không nên khôi phục trừ khi thực sự cần thiết

---

## 🆘 Troubleshooting

### Lỗi: "Cannot drop table because it is referenced by a foreign key"

**Giải pháp:** Migration đã tắt `FOREIGN_KEY_CHECKS`, nhưng nếu vẫn lỗi:

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Chạy lại các lệnh DROP TABLE
SET FOREIGN_KEY_CHECKS = 1;
```

### Lỗi: "Table doesn't exist"

**Giải pháp:** Bình thường, có nghĩa là bảng đã được xóa trước đó. Migration sử dụng `DROP TABLE IF EXISTS` nên an toàn.

### Backend không khởi động sau migration

**Giải pháp:**
1. Kiểm tra logs: `tail -f backend/logs/app.log`
2. Kiểm tra Sequelize sync: Đảm bảo `force: false` trong config
3. Restart backend: `npm start`

---

## ✅ Checklist hoàn thành

- [ ] Đã backup database
- [ ] Đã đọc kỹ danh sách bảng sẽ xóa
- [ ] Đã chạy migration thành công
- [ ] Đã kiểm tra số lượng bảng (13 bảng)
- [ ] Backend khởi động không lỗi
- [ ] Các API endpoints hoạt động bình thường
- [ ] Đã test frontend (nếu có)
- [ ] Đã lưu file backup an toàn

---

**Tạo bởi:** AI Assistant  
**Ngày:** 2025-11-27  
**Phiên bản:** 1.0  
**Migration file:** `011_remove_unused_tables.sql`



