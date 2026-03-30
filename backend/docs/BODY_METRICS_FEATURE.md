# Body Metrics Feature Documentation

## Overview
The Body Metrics feature allows users to track their physical measurements over time, including weight, body composition, and body measurements. The system automatically calculates BMI and WHR (Waist-to-Hip Ratio) based on the provided measurements.

## Database Schema

### User Model Updates
The User model has been updated with the following new fields:

- `targetWeight` (FLOAT): User's target weight in kg (renamed from `currentWeight`)
- `waistCircumference` (FLOAT): Waist circumference in cm
- `hipCircumference` (FLOAT): Hip circumference in cm
- `muscleMass` (FLOAT): Muscle mass in kg
- `bmi` (FLOAT): Body Mass Index (auto-calculated)
- `whr` (FLOAT): Waist-to-Hip Ratio (auto-calculated)

### Body Metrics History Table
A new table `body_metrics_history` has been created to track user measurements over time:

```sql
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
  `recorded_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_recorded` (`user_id`,`recorded_at`),
  KEY `idx_user_created` (`user_id`,`created_at`),
  CONSTRAINT `body_metrics_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
)
```

## API Endpoints

### Base URL: `/api/body-metrics`

#### 1. Get Metrics History
```
GET /history?limit=100
```
**Authentication**: Required

**Query Parameters**:
- `limit` (optional): Number of entries to return (default: 100)

**Response**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "weight": 70.5,
    "height": 175,
    "waistCircumference": 80,
    "hipCircumference": 95,
    "bodyFatPercentage": 15.2,
    "muscleMass": 32.5,
    "bmi": 23.02,
    "whr": 0.84,
    "notes": "Feeling great!",
    "recordedAt": "2025-11-27T10:00:00.000Z",
    "createdAt": "2025-11-27T10:00:00.000Z",
    "updatedAt": "2025-11-27T10:00:00.000Z"
  }
]
```

#### 2. Get Latest Metrics
```
GET /latest
```
**Authentication**: Required

**Response**: Single metrics entry (same format as above)

#### 3. Add New Metrics Entry
```
POST /add
```
**Authentication**: Required

**Request Body**:
```json
{
  "weight": 70.5,
  "height": 175,
  "waistCircumference": 80,
  "hipCircumference": 95,
  "bodyFatPercentage": 15.2,
  "muscleMass": 32.5,
  "notes": "Weekly measurement",
  "recordedAt": "2025-11-27T10:00:00.000Z"
}
```

**Note**: 
- `weight` is required
- `bmi` and `whr` are calculated automatically
- User's current metrics are automatically updated when adding a new entry

**Response**: Created metrics entry

#### 4. Update Metrics Entry
```
PUT /:id
```
**Authentication**: Required

**Request Body**: Same as Add (all fields optional except at least one should be provided)

**Response**: Updated metrics entry

#### 5. Delete Metrics Entry
```
DELETE /:id
```
**Authentication**: Required

**Response**:
```json
{
  "message": "Metrics entry deleted successfully"
}
```

#### 6. Get Statistics
```
GET /stats?days=30
```
**Authentication**: Required

**Query Parameters**:
- `days` (optional): Number of days to include in statistics (default: 30)

**Response**:
```json
{
  "totalEntries": 10,
  "dateRange": {
    "start": "2025-10-28T10:00:00.000Z",
    "end": "2025-11-27T10:00:00.000Z"
  },
  "weightChange": -2.5,
  "bmiChange": -0.8,
  "bodyFatChange": -1.2,
  "muscleMassChange": 0.5,
  "data": [/* array of metrics entries */]
}
```

#### 7. Get Weight Progress
```
GET /progress
```
**Authentication**: Required

**Response**:
```json
{
  "currentWeight": 70.5,
  "targetWeight": 68.0,
  "startWeight": 75.0,
  "weightLostSoFar": 4.5,
  "remainingWeight": 2.5,
  "progress": 64.29,
  "isOnTrack": true
}
```

## Automatic Calculations

### BMI (Body Mass Index)
BMI is automatically calculated using the formula:
```
BMI = weight (kg) / (height (m))²
```

### WHR (Waist-to-Hip Ratio)
WHR is automatically calculated using the formula:
```
WHR = waist_circumference / hip_circumference
```

Both calculations are performed:
1. When creating a new user (in User model hooks)
2. When updating user metrics (in User model hooks)
3. When adding/updating body metrics history entries (in BodyMetricsHistory model hooks)

## Service Layer

The `bodyMetricsService.js` provides the following functions:

- `addBodyMetrics(userId, metricsData)`: Add new metrics and update user's current values
- `updateUserCurrentMetrics(userId)`: Sync user's metrics with latest history entry
- `getMetricsHistory(userId, limit)`: Get metrics history
- `getLatestMetrics(userId)`: Get most recent metrics entry
- `getMetricsStats(userId, days)`: Get statistics over a time period
- `updateMetrics(userId, metricsId, updateData)`: Update a specific entry
- `deleteMetrics(userId, metricsId)`: Delete a specific entry
- `getWeightProgress(userId)`: Calculate progress toward target weight

## Frontend Integration

### Onboarding Screen Updates
The onboarding screen has been updated to collect:
- Target weight
- Waist circumference
- Hip circumference
- Body fat percentage
- Muscle mass

BMI and WHR are calculated automatically and don't need to be entered by the user.

### Profile & Dashboard Updates
Both screens now use the automatically calculated BMI from the user profile instead of manually calculating it each time.

## Migration Files

Two migration files have been created:

1. `007_update_user_health_metrics.sql`: Updates the users table with new fields
2. `008_create_body_metrics_history.sql`: Creates the body_metrics_history table

Run these migrations in order to update your database schema.

## Usage Examples

### Adding a New Measurement
```javascript
const response = await fetch('http://localhost:5000/api/body-metrics/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    weight: 70.5,
    waistCircumference: 80,
    hipCircumference: 95,
    bodyFatPercentage: 15.2,
    notes: 'Weekly check-in'
  })
});
```

### Getting Progress
```javascript
const response = await fetch('http://localhost:5000/api/body-metrics/progress', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const progress = await response.json();
console.log(`You've lost ${progress.weightLostSoFar}kg!`);
console.log(`Progress: ${progress.progress.toFixed(1)}%`);
```

## Best Practices

1. **Regular Tracking**: Encourage users to log their metrics at regular intervals (e.g., weekly)
2. **Same Conditions**: Measurements should ideally be taken under similar conditions (e.g., morning, before eating)
3. **Multiple Metrics**: Track multiple metrics (not just weight) for a complete picture of progress
4. **Notes**: Use the notes field to record context (e.g., "after vacation", "started new workout program")

## Future Enhancements

Potential improvements for this feature:
- Charts and visualizations for metrics over time
- Goal setting and reminders for taking measurements
- Photo progress tracking
- Export data to CSV/PDF
- Integration with fitness trackers and smart scales
- Body measurements predictions based on trends



