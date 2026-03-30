# 🔥 Tóm tắt Cải tiến Tính toán Calories

## ✅ Đã hoàn thành

### 📊 1. MEAL PLAN SERVICE

#### **Vấn đề cũ:**
- Mỗi ngày có số calories khác nhau (không nhất quán)
- Không rõ ràng về BMR và TDEE

#### **Giải pháp mới:**
✅ **Tính BMR chính xác** (Mifflin-St Jeor Equation)
```
BMR (nam)   = 10 × cân nặng + 6.25 × chiều cao - 5 × tuổi + 5
BMR (nữ)    = 10 × cân nặng + 6.25 × chiều cao - 5 × tuổi - 161
```

✅ **Tính TDEE chính xác**
```
TDEE = BMR × Activity Level
- Sedentary: BMR × 1.2
- Lightly Active: BMR × 1.375
- Moderately Active: BMR × 1.55
- Very Active: BMR × 1.725
- Extra Active: BMR × 1.9
```

✅ **Điều chỉnh theo mục tiêu**
```
- Giảm cân:  TDEE - 500 kcal
- Tăng cơ:   TDEE + 300 kcal
- Tăng cân:  TDEE + 500 kcal
- Duy trì:   TDEE
```

✅ **Số calories mỗi ngày GIỐNG NHAU** (±50 kcal)
```
Ngày 1: 2000 kcal
Ngày 2: 2000 kcal  ← CÙNG số calories
Ngày 3: 2000 kcal  ← CÙNG số calories
...
```

---

### 💪 2. WORKOUT PLAN SERVICE

#### **Vấn đề cũ:**
- Calories chỉ ước lượng, không chính xác
- Không dựa trên cân nặng người dùng

#### **Giải pháp mới:**
✅ **Công thức MET (Metabolic Equivalent of Task)**
```
Calories = MET × Cân nặng (kg) × Thời gian (giờ)
```

✅ **Bảng MET values chuẩn**
```
Push-ups/Pull-ups:      8.0 MET
Squats:                 5.5 MET
Burpees:               10.0 MET
Chạy bộ:                9.0 MET
HIIT:                  12.0 MET
Tập tạ (moderate):      5.0 MET
Yoga:                   4.0 MET
```

✅ **Tính calories chính xác cho từng bài tập**
```javascript
// Ví dụ: Push-ups (3 sets × 15 reps) - User 70kg
- Thời gian: 3 × 15 × 3 giây = 135 giây = 0.0375 giờ
- Rest: 2 × 30 giây = 60 giây
- Tổng: 0.054 giờ
- Calories = 8.0 × 70 × 0.054 = 30 kcal
```

✅ **Tổng calories = Tổng của tất cả bài tập**
```
Exercise 1: 30 kcal
Exercise 2: 25 kcal
Exercise 3: 20 kcal
Exercise 4: 15 kcal
Warm-up/Cool-down: 50 kcal
------------------------
TỔNG: 140 kcal  ← Chính xác!
```

---

## 🎯 3. KẾT QUẢ

### Meal Plan:
- ✅ Mỗi ngày có **số calories giống nhau**
- ✅ Dựa trên **BMR và TDEE** khoa học
- ✅ **Điều chỉnh theo mục tiêu** (giảm/tăng/duy trì cân)
- ✅ AI prompt được **cải tiến** để đảm bảo nhất quán

### Workout Plan:
- ✅ **Tính chính xác calories** cho mỗi bài tập
- ✅ Dựa trên **công thức MET** chuẩn khoa học
- ✅ **Tính theo cân nặng** của user
- ✅ **Tổng calories** = tổng của tất cả bài tập
- ✅ AI prompt được **cải tiến** với hướng dẫn chi tiết

---

## 📊 4. VÍ DỤ THỰC TẾ

### User Profile:
```
Tuổi: 30
Giới tính: Nam
Chiều cao: 175 cm
Cân nặng: 70 kg
Activity Level: Moderately Active
Mục tiêu: Giảm cân
```

### Meal Plan Calculation:
```
1. BMR = 10×70 + 6.25×175 - 5×30 + 5 = 1649 kcal/ngày
2. TDEE = 1649 × 1.55 = 2556 kcal/ngày
3. Target (giảm cân) = 2556 - 500 = 2056 kcal/ngày

✓ Meal Plan: Mỗi ngày 2056 kcal (consistent)
```

### Workout Plan Calculation:
```
Workout 45 phút - Upper Body:

1. Push-ups (3×15):        30 kcal
2. Dumbbell Rows (3×12):   25 kcal
3. Shoulder Press (3×10):  20 kcal
4. Pull-ups (3×8):         17 kcal
5. Warm-up + Cool-down:    50 kcal
   
TỔNG:                     142 kcal

✓ Chính xác dựa trên MET formula
```

---

## 🔧 5. FILES THAY ĐỔI

### backend/services/mealPlanService.js
- ✅ Added `calculateBMR()` function
- ✅ Added `calculateTDEE()` function
- ✅ Improved `calculateDailyCalories()` - returns breakdown
- ✅ Updated AI prompt - enforce consistent daily calories
- ✅ Save BMR, TDEE to database

### backend/services/workoutPlanService.js
- ✅ Added `MET_VALUES` constant table
- ✅ Added `calculateExerciseCalories()` function
- ✅ Updated AI prompt - use MET formula for all exercises
- ✅ Added calorie calculation examples
- ✅ Added validation rules

---

## 📚 6. CƠNG THỨC KHOA HỌC

### BMR - Mifflin-St Jeor Equation
- Được Hiệp hội Dinh dưỡng Hoa Kỳ khuyến nghị
- Độ chính xác: ±10%
- Tốt hơn Harris-Benedict cho dân số hiện đại

### MET - Metabolic Equivalent of Task
- Nguồn: Compendium of Physical Activities
- Tiêu chuẩn quốc tế
- Được các chuyên gia fitness sử dụng toàn cầu

### TDEE Multipliers
- Dựa trên nghiên cứu mức độ hoạt động thể chất
- Validated qua doubly labeled water studies

---

## 🚀 7. HƯỚNG DẪN SỬ DỤNG

### Generate Meal Plan:
```javascript
POST /api/nutrition/meal-plans/generate

Response sẽ bao gồm:
{
  "calorieBreakdown": {
    "bmr": 1649,              // ← NEW
    "tdee": 2556,             // ← NEW
    "targetCalories": 2056,   // ← NEW
    "adjustment": -500,       // ← NEW
    "adjustmentReason": "500 cal deficit for weight loss"
  },
  "days": [
    {
      "dayNumber": 1,
      "dailyTotals": {
        "calories": 2056  // ← Consistent mỗi ngày
      }
    }
  ]
}
```

### Generate Workout Plan:
```javascript
POST /api/workout-plans/generate

Response sẽ tính calories chính xác cho từng exercise dựa trên:
- User weight
- MET values
- Exercise duration/sets/reps

{
  "days": [
    {
      "dayNumber": 1,
      "estimatedCalories": 320,  // ← Sum of all exercises
      "exercises": [
        {
          "exerciseName": "Push-ups",
          "sets": 3,
          "reps": 15,
          "estimatedCalories": 60  // ← Accurate MET calculation
        }
      ]
    }
  ]
}
```

---

## ✨ 8. LỢI ÍCH

### Cho User:
- ✅ Meal plan dễ theo dõi (số calories nhất quán)
- ✅ Workout plan realistic (biết chính xác calories tiêu hao)
- ✅ Hiểu rõ logic tính toán (BMR, TDEE, MET)
- ✅ Tin tưởng vào hệ thống

### Cho Developer:
- ✅ Code rõ ràng, khoa học
- ✅ Dễ maintain và mở rộng
- ✅ Có documentation đầy đủ
- ✅ Follow best practices

### Cho AI:
- ✅ Prompt rõ ràng hơn
- ✅ Có examples cụ thể
- ✅ Validation rules chi tiết
- ✅ Output consistent hơn

---

## 📖 9. TÀI LIỆU THAM KHẢO

Chi tiết đầy đủ xem tại:
📄 `backend/services/CALORIE_CALCULATION_IMPROVEMENTS.md`

---

**Cập nhật:** 2025-12-25  
**Status:** ✅ Completed & Tested  
**Breaking Changes:** ❌ None (Backward compatible)



