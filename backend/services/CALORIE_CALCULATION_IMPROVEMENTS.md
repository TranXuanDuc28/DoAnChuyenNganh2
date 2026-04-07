# 🔥 Calorie Calculation Improvements

## Tổng quan
Cải thiện logic tính toán calories cho **Meal Plan** và **Workout Plan** để đảm bảo tính chính xác và nhất quán.

---

## 📊 1. MEAL PLAN SERVICE - Cải tiến

### 1.1 Tính toán BMR & TDEE chính xác

#### **Công thức Mifflin-St Jeor Equation**

```javascript
// BMR (Basal Metabolic Rate) - Calories burned at rest
BMR (male)   = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
BMR (female) = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
```

#### **TDEE (Total Daily Energy Expenditure)**

```javascript
TDEE = BMR × Activity Level Multiplier

Activity Multipliers:
- Sedentary (little/no exercise):        1.2
- Lightly Active (1-3 days/week):        1.375
- Moderately Active (3-5 days/week):     1.55
- Very Active (6-7 days/week):           1.725
- Extra Active (athlete/physical job):   1.9
```

#### **Target Calories theo Goal**

```javascript
// Weight Loss (giảm cân)
Target = TDEE - 500 kcal  // Deficit 500 cal → lose ~0.5kg/week

// Muscle Building (tăng cơ)
Target = TDEE + 300 kcal  // Surplus 300 cal → muscle gain

// Weight Gain (tăng cân)
Target = TDEE + 500 kcal  // Surplus 500 cal → gain ~0.5kg/week

// Maintenance (duy trì)
Target = TDEE             // No change
```

### 1.2 Consistent Daily Calories

**VẤN ĐỀ CŨ:**
- Mỗi ngày có số calories khác nhau
- Không nhất quán với TDEE

**GIẢI PHÁP MỚI:**
```javascript
Day 1: 2000 kcal
Day 2: 2000 kcal  // ← SAME
Day 3: 2000 kcal  // ← SAME
Day 4: 2000 kcal  // ← SAME
...
Day 7: 2000 kcal  // ← SAME

✓ Tolerance: ±50 kcal maximum variance
✓ Macros consistent across all days
```

### 1.3 AI Prompt Cải tiến

**CHỈ DẪN CHO AI:**
```
CRITICAL INSTRUCTIONS:
1. Each day MUST have EXACTLY [targetCalories] kcal (±50 kcal max)
2. Daily macro targets CONSISTENT across all days:
   - Protein: [X]g ± 5g
   - Carbs: [Y]g ± 10g
   - Fat: [Z]g ± 5g
3. Vary food choices but MAINTAIN consistent daily totals
```

**EXAMPLE:**
```json
{
  "day1": {
    "breakfast": 400 kcal,
    "lunch": 600 kcal,
    "dinner": 700 kcal,
    "snack": 300 kcal,
    "totalCalories": 2000 kcal  // ← Target
  },
  "day2": {
    "breakfast": 420 kcal,  // Different food
    "lunch": 580 kcal,      // Different food
    "dinner": 720 kcal,     // Different food
    "snack": 280 kcal,      // Different food
    "totalCalories": 2000 kcal  // ← SAME as Day 1
  }
}
```

### 1.4 Database Storage

```javascript
MealPlan {
  totalCalories: 2000,  // Target daily calories
  preferences: {
    bmr: 1600,           // ← NEW: Basal Metabolic Rate
    tdee: 2000,          // ← NEW: Total Daily Energy Expenditure
    targetCalories: 2000, // ← NEW: Adjusted target
    calorieAdjustment: 0, // ← NEW: Adjustment amount
    adjustmentReason: "Maintenance calories" // ← NEW
  }
}
```

---

## 💪 2. WORKOUT PLAN SERVICE - Cải tiến

### 2.1 MET Values (Metabolic Equivalent of Task)

**MET** = Tỷ lệ trao đổi chất so với nghỉ ngơi

#### **Strength Training**
```
Light effort:       3.5 MET  (light weights, bodyweight)
Moderate effort:    5.0 MET  (general weight lifting)
Vigorous effort:    6.0 MET  (heavy weights, intense)
```

#### **Cardio**
```
Light (walking):         4.0 MET
Moderate (jogging):      6.5 MET
Vigorous (running):      9.0 MET
Intense (HIIT/sprint):  12.0 MET
```

#### **Specific Exercises**
```
Push-ups:          8.0 MET
Pull-ups:          8.0 MET
Squats:            5.5 MET
Burpees:          10.0 MET
Jumping Jacks:     8.0 MET
Plank:             4.0 MET
Yoga (Power):      4.0 MET
Stretching:        2.3 MET
```

### 2.2 Calorie Calculation Formula

```javascript
Calories = MET × Weight(kg) × Duration(hours)
```

#### **Example 1: Push-ups (Strength)**
```
User weight: 70 kg
Exercise: 3 sets × 12 reps

Step 1: Calculate duration
- Time per rep: 3 seconds
- Total reps: 3 × 12 = 36 reps
- Exercise time: 36 × 3 = 108 seconds
- Rest time: 2 sets × 30 sec = 60 seconds (rest between sets)
- Total time: 108 + 60 = 168 seconds = 0.047 hours

Step 2: Calculate calories
- MET for push-ups: 8.0
- Calories = 8.0 × 70 kg × 0.047 hours
- Calories = 26 kcal

✓ Result: ~26 calories burned
```

#### **Example 2: Running (Cardio)**
```
User weight: 70 kg
Exercise: 20 minutes running

Step 1: Convert duration
- Duration: 20 minutes = 0.33 hours

Step 2: Calculate calories
- MET for running: 9.0
- Calories = 9.0 × 70 kg × 0.33 hours
- Calories = 208 kcal

✓ Result: ~208 calories burned
```

#### **Example 3: HIIT (High Intensity)**
```
User weight: 70 kg
Exercise: 15 minutes HIIT

Step 1: Convert duration
- Duration: 15 minutes = 0.25 hours

Step 2: Calculate calories
- MET for HIIT: 12.0
- Calories = 12.0 × 70 kg × 0.25 hours
- Calories = 210 kcal

✓ Result: ~210 calories burned
```

### 2.3 Typical Calorie Burn per Session

```
30-minute workout:
- Yoga/Stretching:     80-120 kcal
- Strength Training:   150-250 kcal
- Moderate Cardio:     200-300 kcal
- Intense Cardio/HIIT: 300-450 kcal

60-minute workout:
- Yoga/Stretching:     160-240 kcal
- Strength Training:   300-500 kcal
- Moderate Cardio:     400-600 kcal
- Intense Cardio/HIIT: 600-900 kcal
```

### 2.4 AI Prompt Cải tiến

**CHỈ DẪN CHO AI:**
```
CALORIE CALCULATION FORMULA (Use for ALL exercises):
Formula: Calories = MET × Weight(kg) × Duration(hours)

User Weight: 70 kg (CRITICAL for calculations)

INSTRUCTIONS:
1. Use MET formula for EVERY exercise
2. Calculate ACCURATE calories based on user weight
3. Sum all exercise calories → "estimatedCalories"
4. Verify total calories are realistic (200-600 kcal per session)

EXAMPLE:
{
  "dayNumber": 1,
  "totalDuration": 45,
  "estimatedCalories": 320,  // ← SUM of all exercises
  "exercises": [
    {
      "exerciseName": "Push-ups",
      "sets": 3,
      "reps": 15,
      "estimatedCalories": 60,  // ← 8.0 MET × 70 kg × time
      "restSeconds": 30
    },
    {
      "exerciseName": "Squats",
      "sets": 4,
      "reps": 12,
      "estimatedCalories": 55,  // ← 5.5 MET × 70 kg × time
      "restSeconds": 30
    },
    // ... more exercises
    // Total: 60 + 55 + ... = 320 kcal ✓
  ]
}
```

### 2.5 Validation Rules

```javascript
✓ Each exercise has accurate calorie calculation
✓ Total workout calories = Sum of all exercise calories
✓ Calories realistic based on duration and intensity
✓ HIIT/Cardio burns more than Strength Training
✓ User weight (kg) is used in ALL calculations
```

---

## 📈 3. BENEFITS

### 3.1 Meal Plan
✅ **Consistent calories mỗi ngày** → Easier to track and follow  
✅ **BMR & TDEE chính xác** → Science-based approach  
✅ **Goal-based adjustment** → Personalized for weight loss/gain/maintenance  
✅ **Transparent calculations** → User hiểu rõ con số từ đâu

### 3.2 Workout Plan
✅ **Accurate calorie burn** → Realistic expectations  
✅ **MET-based formula** → Scientific standard  
✅ **Weight-specific** → Personalized for each user  
✅ **Exercise-specific** → Different exercises burn different calories  
✅ **Summation validation** → Total equals sum of parts

---

## 🔬 4. SCIENTIFIC BASIS

### 4.1 Mifflin-St Jeor Equation
- Most accurate BMR equation (±10% accuracy)
- Validated by American Dietetic Association
- Better than Harris-Benedict for modern populations

### 4.2 MET Values
- Source: Compendium of Physical Activities
- Published by Medicine & Science in Sports & Exercise
- Standardized metabolic measurements
- Used by fitness professionals worldwide

### 4.3 TDEE Multipliers
- Based on physical activity level research
- Validated through doubly labeled water studies
- Accounts for non-exercise activity thermogenesis (NEAT)

---

## 📊 5. EXAMPLE CALCULATIONS

### User Profile
```
Name: John Doe
Age: 30 years
Gender: Male
Height: 175 cm
Weight: 70 kg
Activity Level: Moderately Active
Goal: Lose Weight
```

### Meal Plan Calculation
```
Step 1: BMR
BMR = 10 × 70 + 6.25 × 175 - 5 × 30 + 5
    = 700 + 1093.75 - 150 + 5
    = 1648.75 kcal/day

Step 2: TDEE
TDEE = BMR × Activity Multiplier
     = 1648.75 × 1.55 (moderately active)
     = 2555.56 kcal/day

Step 3: Target Calories (Weight Loss)
Target = TDEE - 500
       = 2555.56 - 500
       = 2055.56 ≈ 2056 kcal/day

✓ Each day in meal plan: 2056 kcal
```

### Workout Plan Calculation
```
Workout: 45 minutes Upper Body

Exercise 1: Push-ups (3 sets × 15 reps)
- Time: 3 × 15 × 3 sec = 135 sec = 0.0375 hours
- Rest: 2 × 30 sec = 60 sec = 0.0167 hours
- Total: 0.0542 hours
- Calories: 8.0 MET × 70 kg × 0.0542 = 30 kcal

Exercise 2: Dumbbell Rows (3 sets × 12 reps)
- Time: 3 × 12 × 3 sec = 108 sec = 0.03 hours
- Rest: 2 × 30 sec = 60 sec = 0.0167 hours
- Total: 0.0467 hours
- Calories: 5.0 MET × 70 kg × 0.0467 = 16 kcal

Exercise 3: Shoulder Press (3 sets × 10 reps)
- Calories: ~15 kcal

Exercise 4: Bench Press (4 sets × 8 reps)
- Calories: ~20 kcal

Exercise 5: Pull-ups (3 sets × 8 reps)
- Calories: 8.0 MET × 70 kg × 0.03 = 17 kcal

Warm-up (5 min) + Cool-down (5 min):
- Calories: 4.0 MET × 70 kg × 0.167 = 47 kcal

Total Workout Calories:
30 + 16 + 15 + 20 + 17 + 47 = 145 kcal

✓ Estimated: ~150 kcal per session
```

---

## 🎯 6. IMPLEMENTATION STATUS

### ✅ Completed
- [x] Meal Plan: BMR calculation
- [x] Meal Plan: TDEE calculation
- [x] Meal Plan: Consistent daily calories
- [x] Meal Plan: Improved AI prompt
- [x] Workout Plan: MET values table
- [x] Workout Plan: Calorie calculation function
- [x] Workout Plan: Improved AI prompt
- [x] Workout Plan: Validation rules
- [x] Documentation

### 📝 Functions Added

**mealPlanService.js**
```javascript
calculateBMR(user)           // ← NEW
calculateTDEE(bmr, activityLevel)  // ← NEW
calculateDailyCalories(user) // ← IMPROVED (returns breakdown)
```

**workoutPlanService.js**
```javascript
MET_VALUES                   // ← NEW (constant table)
calculateExerciseCalories(exercise, userWeight)  // ← NEW
```

---

## 🔄 7. MIGRATION NOTES

### Database Changes
**Không cần migration** - Các thay đổi chỉ ở logic tính toán và AI prompts.

### Backward Compatibility
✅ **Tương thích ngược** - Meal plans cũ vẫn hoạt động bình thường  
✅ **Workout plans cũ** vẫn có thể xem được  
✅ **Chỉ plans mới** sử dụng logic tính toán mới

---

## 📚 8. REFERENCES

1. **Mifflin-St Jeor Equation**
   - Mifflin MD, et al. (1990). "A new predictive equation for resting energy expenditure in healthy individuals"
   - American Journal of Clinical Nutrition

2. **MET Values**
   - Ainsworth BE, et al. (2011). "Compendium of Physical Activities"
   - Medicine & Science in Sports & Exercise

3. **TDEE & Activity Levels**
   - Institute of Medicine (2005). "Dietary Reference Intakes for Energy"
   - National Academies Press

4. **Calorie Deficit for Weight Loss**
   - Hall KD, et al. (2011). "Quantification of the effect of energy imbalance on bodyweight"
   - The Lancet

---

## 🚀 9. FUTURE IMPROVEMENTS

### Potential Enhancements
1. **Adaptive TDEE** - Adjust based on actual weight loss/gain rate
2. **Exercise-specific MET** - More granular MET values per exercise in database
3. **Heart Rate Integration** - Use HR data for more accurate calorie burn
4. **Progressive Overload** - Auto-adjust calories as user gets stronger
5. **Weekly Variance** - Allow slight calorie cycling (higher/lower days)

---

**Updated:** 2025-12-25  
**Version:** 2.0  
**Author:** AI Assistant



