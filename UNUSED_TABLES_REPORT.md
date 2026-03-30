# Báo cáo: Các Bảng Không Được Sử Dụng Trong Dự Án

## Tổng quan
Dự án có **26 bảng** được định nghĩa trong migration `001_create_database.sql`, nhưng **không phải tất cả** đều được sử dụng trong code.

---

## 📊 Phân loại các bảng

### ✅ **Bảng ĐANG ĐƯỢC SỬ DỤNG** (16 bảng)

#### 1. **User & Authentication** (1 bảng)
- ✅ `users` - Được sử dụng trong `models/User.js`, `routes/auth.js`, và nhiều nơi khác

#### 2. **Workout Management** (4 bảng)
- ✅ `exercises` - Được sử dụng trong `models/Workout.js`
- ✅ `workouts` - Được sử dụng trong `models/Workout.js`, `routes/workouts.js`
- ✅ `workout_sessions` - Được sử dụng trong `models/Workout.js`
- ✅ `workout_plans` - Được sử dụng trong `models/Workout.js`, `routes/workoutPlan.js`

#### 3. **Nutrition Tracking** (5 bảng)
- ✅ `foods` - Được sử dụng trong `models/Nutrition.js`, `routes/nutrition.js`
- ✅ `nutrition_entries` - Được sử dụng trong `models/Nutrition.js`, `routes/nutrition.js`
- ✅ `nutrition_goals` - Được sử dụng trong `models/Nutrition.js`, `routes/nutrition.js`
- ✅ `meal_plans` - Được sử dụng trong `models/Nutrition.js`, `routes/nutrition.js`, `routes/ai.js`
- ✅ `water_intakes` - Được sử dụng trong `models/Nutrition.js`, `routes/nutrition.js`

#### 4. **Health Tracking** (6 bảng)
- ✅ `sleep_records` - Được sử dụng trong `models/Health.js`, `routes/health.js`
- ✅ `heart_rate_records` - Được sử dụng trong `models/Health.js`, `routes/health.js`
- ✅ `stress_records` - Được sử dụng trong `models/Health.js`, `routes/health.js`
- ✅ `weight_records` - Được sử dụng trong `models/Health.js`, `routes/health.js`
- ✅ `activity_records` - Được sử dụng trong `models/Health.js`, `routes/health.js`
- ✅ `breathing_exercises` - Được sử dụng trong `models/Health.js`, `routes/health.js`
- ✅ `health_goals` - Được sử dụng trong `models/Health.js`, `routes/health.js`

---

### ❌ **Bảng KHÔNG ĐƯỢC SỬ DỤNG** (3 bảng)

#### 1. **`meals`** ❌
**Trạng thái:** KHÔNG được sử dụng
- **Định nghĩa:** `migrations/001_create_database.sql` (dòng 166-187)
- **Model:** Có định nghĩa trong `models/Nutrition.js` (dòng 66-145)
- **Routes:** KHÔNG có route nào sử dụng
- **Tham chiếu:** Chỉ có `nutrition_entries.mealId` tham chiếu đến bảng này (FOREIGN KEY)

**Lý do không dùng:**
- Dự án sử dụng `meal_plans` (kế hoạch bữa ăn) thay vì `meals` (công thức nấu ăn riêng lẻ)
- `meal_plans` chứa thông tin bữa ăn dưới dạng JSON, không cần bảng `meals` riêng
- Frontend không có màn hình quản lý công thức nấu ăn (recipes)

**Khuyến nghị:** 
- ⚠️ **CÓ THỂ XÓA** nếu không có kế hoạch phát triển tính năng "Meal Recipes"
- Nếu xóa, cần xóa FOREIGN KEY trong `nutrition_entries.mealId`

---

#### 2. **`blood_pressure_records`** ❌
**Trạng thái:** KHÔNG được sử dụng
- **Định nghĩa:** `migrations/001_create_database.sql` (dòng 312-327)
- **Model:** Có định nghĩa trong `models/Health.js` (dòng 187-242)
- **Routes:** KHÔNG có route nào sử dụng
- **Frontend:** Không có API call nào đến `/health/blood-pressure`

**Lý do không dùng:**
- Frontend không có tính năng theo dõi huyết áp
- `routes/health.js` không có endpoint cho blood pressure
- Bảng `users` có cột `bloodPressureSystolic` và `bloodPressureDiastolic` nhưng không được sử dụng

**Khuyến nghị:**
- ⚠️ **CÓ THỂ XÓA** nếu không có kế hoạch theo dõi huyết áp chi tiết
- Hoặc **THÊM ROUTES** nếu muốn sử dụng trong tương lai

---

#### 3. **`menstrual_cycles`** ❌
**Trạng thái:** KHÔNG được sử dụng
- **Định nghĩa:** `migrations/001_create_database.sql` (dòng 383-397)
- **Model:** Có định nghĩa trong `models/Health.js` (dòng 438-488)
- **Routes:** KHÔNG có route nào sử dụng
- **Frontend:** Không có API call nào đến `/health/menstrual`

**Lý do không dùng:**
- Frontend không có tính năng theo dõi chu kỳ kinh nguyệt
- `routes/health.js` không có endpoint cho menstrual cycle
- Có thể là tính năng dành cho tương lai nhưng chưa triển khai

**Khuyến nghị:**
- ⚠️ **CÓ THỂ XÓA** nếu không phù hợp với mục tiêu dự án
- Hoặc **THÊM ROUTES** nếu muốn hỗ trợ người dùng nữ theo dõi chu kỳ

---

## 📋 Tóm tắt

| Loại bảng | Tổng số | Đang dùng | Không dùng |
|-----------|---------|-----------|------------|
| **User & Auth** | 1 | 1 ✅ | 0 |
| **Workout** | 4 | 4 ✅ | 0 |
| **Nutrition** | 6 | 5 ✅ | 1 ❌ (`meals`) |
| **Health** | 9 | 6 ✅ | 2 ❌ (`blood_pressure_records`, `menstrual_cycles`) |
| **TỔNG** | **20** | **16** | **3** |

---

## 🔍 Chi tiết các bảng không dùng

### 1. `meals` - Bảng công thức nấu ăn
```sql
-- Có thể xóa nếu không cần
DROP TABLE IF EXISTS meals;

-- Và xóa FOREIGN KEY trong nutrition_entries
ALTER TABLE nutrition_entries DROP FOREIGN KEY nutrition_entries_ibfk_3;
ALTER TABLE nutrition_entries DROP COLUMN mealId;
```

**Ảnh hưởng:**
- ❌ Mất khả năng lưu công thức nấu ăn chi tiết
- ✅ Giảm độ phức tạp của database
- ✅ `meal_plans` vẫn hoạt động bình thường

---

### 2. `blood_pressure_records` - Theo dõi huyết áp
```sql
-- Có thể xóa nếu không cần
DROP TABLE IF EXISTS blood_pressure_records;
```

**Ảnh hưởng:**
- ❌ Mất khả năng theo dõi huyết áp chi tiết theo thời gian
- ✅ Vẫn có thể lưu huyết áp trong bảng `users` (không theo dõi lịch sử)

---

### 3. `menstrual_cycles` - Theo dõi chu kỳ kinh nguyệt
```sql
-- Có thể xóa nếu không cần
DROP TABLE IF EXISTS menstrual_cycles;
```

**Ảnh hưởng:**
- ❌ Mất tính năng dành cho người dùng nữ
- ✅ Giảm độ phức tạp nếu app chủ yếu dành cho nam giới

---

## ✅ **CẬP NHẬT: ĐÃ XÓA CÁC MODEL KHÔNG DÙNG**

**Ngày cập nhật:** 2025-11-27

### Các thay đổi đã thực hiện:

#### 1. ✅ Đã xóa model `Meal` khỏi `backend/models/Nutrition.js`
- Xóa toàn bộ định nghĩa model Meal (dòng 66-145)
- Xóa `Meal` khỏi module.exports
- Xóa foreign key `mealId` trong model `NutritionEntry`

#### 2. ✅ Đã xóa model `BloodPressureRecord` khỏi `backend/models/Health.js`
- Xóa toàn bộ định nghĩa model BloodPressureRecord (dòng 187-242)
- Xóa `BloodPressureRecord` khỏi module.exports

#### 3. ✅ Đã xóa model `MenstrualCycle` khỏi `backend/models/Health.js`
- Xóa toàn bộ định nghĩa model MenstrualCycle (dòng 438-488)
- Xóa `MenstrualCycle` khỏi module.exports

### ⚠️ Bước tiếp theo:

**Cần chạy migration để xóa bảng trong database:**
```bash
cd backend
mysql -u root -p fitness_app < migrations/010_remove_unused_tables.sql
```

Hoặc xem hướng dẫn chi tiết trong `backend/migrations/README_CLEANUP_UNUSED_TABLES.md`

---

## 💡 Khuyến nghị hành động

### ~~Tùy chọn 1: **Xóa các bảng không dùng** (Đơn giản hóa)~~ ✅ ĐÃ HOÀN THÀNH
**Ưu điểm:**
- Giảm độ phức tạp của database
- Dễ bảo trì hơn
- Tăng hiệu suất (ít bảng hơn)

**Nhược điểm:**
- Mất tính năng tiềm năng trong tương lai
- Cần migration để xóa

**Cách thực hiện:**
```bash
# ✅ ĐÃ XÓA MODELS - Còn lại cần xóa bảng trong database
cd backend
mysql -u root -p fitness_app < migrations/010_remove_unused_tables.sql
```

---

### Tùy chọn 2: **Giữ lại nhưng đánh dấu** (Linh hoạt)
**Ưu điểm:**
- Giữ lại khả năng mở rộng
- Không cần migration phức tạp

**Nhược điểm:**
- Database vẫn phức tạp
- Có thể gây nhầm lẫn

**Cách thực hiện:**
- Thêm comment trong code
- Tạo document này để tham khảo

---

### Tùy chọn 3: **Triển khai các tính năng còn thiếu** (Đầy đủ)
**Ưu điểm:**
- Tận dụng hết schema đã thiết kế
- Tăng giá trị cho app

**Nhược điểm:**
- Tốn thời gian phát triển
- Tăng độ phức tạp

**Cần làm:**
1. Thêm routes cho `blood_pressure_records` và `menstrual_cycles` trong `routes/health.js`
2. Thêm routes cho `meals` trong `routes/nutrition.js`
3. Tạo UI trong frontend để sử dụng các tính năng này

---

## 📝 Kết luận

Dự án có **3 bảng không được sử dụng**:
1. ~~❌ `meals` - Công thức nấu ăn~~ ✅ **ĐÃ XÓA MODEL**
2. ~~❌ `blood_pressure_records` - Theo dõi huyết áp~~ ✅ **ĐÃ XÓA MODEL**
3. ~~❌ `menstrual_cycles` - Theo dõi chu kỳ kinh nguyệt~~ ✅ **ĐÃ XÓA MODEL**

**✅ Đã hoàn thành:**
- Đã xóa 3 models không sử dụng khỏi code
- Đã xóa foreign key `mealId` trong `NutritionEntry`
- Code đã sạch và tối ưu

**⚠️ Còn lại cần làm:**
- Chạy migration `010_remove_unused_tables.sql` để xóa bảng trong database
- Xem hướng dẫn trong `backend/migrations/README_CLEANUP_UNUSED_TABLES.md`

---

## 📂 File cần chỉnh sửa nếu xóa

### Nếu xóa `meals`:
1. `backend/migrations/001_create_database.sql` - Xóa định nghĩa bảng
2. `backend/models/Nutrition.js` - Xóa model `Meal`
3. `backend/migrations/001_create_database.sql` - Xóa FOREIGN KEY trong `nutrition_entries`

### Nếu xóa `blood_pressure_records`:
1. `backend/migrations/001_create_database.sql` - Xóa định nghĩa bảng
2. `backend/models/Health.js` - Xóa model `BloodPressureRecord`

### Nếu xóa `menstrual_cycles`:
1. `backend/migrations/001_create_database.sql` - Xóa định nghĩa bảng
2. `backend/models/Health.js` - Xóa model `MenstrualCycle`

---

**Ngày tạo:** 2025-11-27  
**Tác giả:** AI Assistant  
**Phiên bản:** 1.0

