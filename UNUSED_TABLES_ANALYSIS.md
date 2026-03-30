# 📊 Phân tích các bảng không sử dụng trong Database

**Ngày phân tích:** 2025-11-27  
**Database:** fitness_appp

---

## 🔍 So sánh Database vs Models

### ✅ Các bảng ĐANG ĐƯỢC SỬ DỤNG (có model)

| Bảng trong DB | Model | File |
|---------------|-------|------|
| `users` | User | User.js |
| `exercises` | Exercise | Workout.js |
| `exercise_categories` | ExerciseCategory | Workout.js |
| `exercise_category_mappings` | (junction table) | Workout.js |
| `workout_plans` | WorkoutPlan | Workout.js |
| `workout_plan_days` | WorkoutPlanDay | Workout.js |
| `workout_plan_day_exercises` | WorkoutPlanDayExercise | Workout.js |
| `meal_plans` | MealPlan | Nutrition.js |
| `ai_suggestions` | AISuggestion | AISuggestion.js |
| `body_metrics_history` | BodyMetricsHistory | BodyMetricsHistory.js |
| `image_evaluations` | ImageEvaluation | ImageEvaluation.js |
| `video_analyses` | VideoAnalysis | VideoAnalysis.js |
| `pose_logs` | PoseLog | Pose.js |

**Tổng: 13 bảng được sử dụng**

---

## ❌ Các bảng KHÔNG ĐƯỢC SỬ DỤNG (không có model)

### 1. **`foods`** - Quản lý thực phẩm
- **Mô tả:** Lưu thông tin thực phẩm, dinh dưỡng, barcode
- **Lý do không dùng:** Model đã bị xóa khỏi Nutrition.js
- **Foreign keys ảnh hưởng:** 
  - `nutrition_entries.food_id` → `foods.id`

### 2. **`meals`** - Công thức nấu ăn
- **Mô tả:** Lưu công thức món ăn, nguyên liệu, hướng dẫn nấu
- **Lý do không dùng:** Model đã bị xóa khỏi Nutrition.js
- **Foreign keys ảnh hưởng:**
  - `nutrition_entries.meal_id` → `meals.id`

### 3. **`nutrition_entries`** - Nhật ký dinh dưỡng
- **Mô tả:** Lưu các bữa ăn hàng ngày của user
- **Lý do không dùng:** Model đã bị xóa khỏi Nutrition.js
- **Foreign keys ảnh hưởng:**
  - Phụ thuộc vào `foods` và `meals`

### 4. **`nutrition_goals`** - Mục tiêu dinh dưỡng
- **Mô tả:** Lưu mục tiêu calories, macros của user
- **Lý do không dùng:** Model đã bị xóa khỏi Nutrition.js

### 5. **`water_intakes`** - Lượng nước uống
- **Mô tả:** Theo dõi lượng nước uống hàng ngày
- **Lý do không dùng:** Model đã bị xóa khỏi Nutrition.js

### 6. **`sleep_records`** - Ghi chú giấc ngủ
- **Mô tả:** Theo dõi chất lượng giấc ngủ
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 7. **`heart_rate_records`** - Nhịp tim
- **Mô tả:** Theo dõi nhịp tim theo thời gian
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 8. **`stress_records`** - Mức độ stress
- **Mô tả:** Theo dõi mức độ stress và coping strategies
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 9. **`blood_pressure_records`** - Huyết áp
- **Mô tả:** Theo dõi huyết áp chi tiết
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 10. **`menstrual_cycles`** - Chu kỳ kinh nguyệt
- **Mô tả:** Theo dõi chu kỳ kinh nguyệt
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 11. **`weight_records`** - Cân nặng
- **Mô tả:** Theo dõi cân nặng theo thời gian
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js
- **Lưu ý:** Đã có `body_metrics_history` thay thế

### 12. **`activity_records`** - Hoạt động hàng ngày
- **Mô tả:** Theo dõi steps, distance, calories burned
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 13. **`breathing_exercises`** - Bài tập thở
- **Mô tả:** Theo dõi các bài tập thở
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 14. **`health_goals`** - Mục tiêu sức khỏe
- **Mô tả:** Mục tiêu về cân nặng, body fat, etc.
- **Lý do không dùng:** Model đã bị xóa khỏi Health.js

### 15. **`workouts`** - Bài tập workout
- **Mô tả:** Lưu các bài workout với exercises
- **Lý do không dùng:** Không có model trong Workout.js
- **Foreign keys ảnh hưởng:**
  - `workout_sessions.workout_id` → `workouts.id`

### 16. **`workout_sessions`** - Phiên tập luyện
- **Mô tả:** Lưu lịch sử các buổi tập
- **Lý do không dùng:** Không có model trong Workout.js
- **Foreign keys ảnh hưởng:**
  - Phụ thuộc vào `workouts`

### 17. **`notifications`** - Thông báo
- **Mô tả:** Hệ thống thông báo cho user
- **Lý do không dùng:** File Notification.js rỗng (không có model)

### 18. **`system_settings`** - Cài đặt hệ thống
- **Mô tả:** Cài đặt chung của hệ thống
- **Lý do không dùng:** File SystemSettings.js rỗng (không có model)

---

## 📈 Thống kê

| Loại | Số lượng | Tỷ lệ |
|------|----------|-------|
| **Tổng số bảng trong DB** | 31 | 100% |
| **Bảng đang dùng** | 13 | 41.9% |
| **Bảng không dùng** | 18 | 58.1% |

---

## ⚠️ Phân tích Foreign Key Dependencies

### Nhóm 1: Nutrition (có dependencies)
```
foods (xóa được)
  ↑
nutrition_entries (phải xóa trước)
  ↑
meals (xóa được)
```

### Nhóm 2: Health (độc lập - xóa dễ dàng)
- `sleep_records` ✅
- `heart_rate_records` ✅
- `stress_records` ✅
- `blood_pressure_records` ✅
- `menstrual_cycles` ✅
- `weight_records` ✅
- `activity_records` ✅
- `breathing_exercises` ✅
- `health_goals` ✅

### Nhóm 3: Nutrition Goals (độc lập)
- `nutrition_goals` ✅
- `water_intakes` ✅

### Nhóm 4: Workout (có dependencies)
```
workouts (xóa được)
  ↑
workout_sessions (phải xóa trước)
```

### Nhóm 5: System (độc lập)
- `notifications` ✅
- `system_settings` ✅

---

## 🎯 Khuyến nghị xóa theo thứ tự

### Bước 1: Xóa các bảng con (có foreign key)
1. `workout_sessions` (phụ thuộc vào `workouts`)
2. `nutrition_entries` (phụ thuộc vào `foods` và `meals`)

### Bước 2: Xóa các bảng cha
3. `workouts`
4. `foods`
5. `meals`

### Bước 3: Xóa các bảng độc lập (Health)
6. `sleep_records`
7. `heart_rate_records`
8. `stress_records`
9. `blood_pressure_records`
10. `menstrual_cycles`
11. `weight_records`
12. `activity_records`
13. `breathing_exercises`
14. `health_goals`

### Bước 4: Xóa các bảng độc lập (Nutrition)
15. `nutrition_goals`
16. `water_intakes`

### Bước 5: Xóa các bảng hệ thống
17. `notifications`
18. `system_settings`

---

## ✅ Kết luận

**Cần xóa 18 bảng không được sử dụng** để:
- Giảm độ phức tạp của database
- Tăng hiệu suất
- Dễ bảo trì hơn
- Tránh nhầm lẫn cho developers

**Lưu ý:**
- ⚠️ **BACKUP DATABASE** trước khi xóa
- ⚠️ Xóa theo đúng thứ tự để tránh lỗi foreign key
- ⚠️ Không thể hoàn tác sau khi xóa



