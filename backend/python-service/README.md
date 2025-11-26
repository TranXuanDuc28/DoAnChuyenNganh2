# Python ML Service

This service provides AI-powered predictions for fitness and diet recommendations using machine learning models (Random Forest).

## Setup

### 1. Copy ML Models

First, copy the trained ML models to this directory:

**Windows (PowerShell):**
```powershell
.\copy-models.ps1
```

**Linux/Mac:**
```bash
chmod +x copy-models.sh
./copy-models.sh
```

**Or manually copy:**
```bash
# From project root
cp "../Personalized-Health-and-Fitness-Recommendation-System/Pycharm Files"/*.pkl ./
```

Required files:
- `rf_diet_model.pkl` - Diet recommendation model
- `rf_exercises_model.pkl` - Exercise recommendation model
- `label_encoders.pkl` - Label encoders for categorical features

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- Flask - Web framework
- flask-cors - CORS support
- joblib - Model loading
- numpy - Numerical computing
- scikit-learn - ML library

### 3. Run the Service

```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "message": "AI Service is running"
}
```

### Get Predictions
```http
POST /predict
Content-Type: application/json

{
  "sex": "Male",
  "age": 25,
  "height": 175,
  "weight": 70,
  "hypertension": "No",
  "diabetes": "No",
  "fitnessGoal": "Weight Loss",
  "fitnessType": "Cardio Fitness"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "exercise": "Brisk walking, cycling, swimming, running, or dancing.",
    "diet": "Vegetables: (Broccoli, Carrots, Spinach...); Protein Intake: (Cheese, Cottage cheese...); Juice: (Fruit Juice, Aloe vera juice...)",
    "bmi": 22.86,
    "level": "Normal",
    "userInfo": {
      "sex": "Male",
      "age": 25,
      "height": 175,
      "weight": 70,
      "hypertension": "No",
      "diabetes": "No",
      "fitnessGoal": "Weight Loss",
      "fitnessType": "Cardio Fitness"
    }
  }
}
```

### Batch Predictions
```http
POST /predict-batch
Content-Type: application/json

{
  "users": [
    {
      "sex": "Male",
      "age": 25,
      "height": 175,
      "weight": 70,
      "hypertension": "No",
      "diabetes": "No",
      "fitnessGoal": "Weight Loss",
      "fitnessType": "Cardio Fitness"
    }
  ]
}
```

## Model Information

### Input Features
1. **Sex**: Male, Female
2. **Age**: Integer (years)
3. **Height**: Float (cm)
4. **Weight**: Float (kg)
5. **Hypertension**: Yes, No
6. **Diabetes**: Yes, No
7. **Fitness Goal**: Weight Loss, Weight Gain
8. **Fitness Type**: Cardio Fitness, Muscular Fitness

### Calculated Features
- **BMI**: Calculated from height and weight
- **Level**: Underweight, Normal, Overweight, Obese (based on BMI)

### Output
- **Exercise Recommendation**: Suggested exercises based on user profile
- **Diet Recommendation**: Detailed diet plan with vegetables, proteins, and juices

## Troubleshooting

### Error: "No module named 'flask'"
```bash
pip install flask flask-cors
```

### Error: "No module named 'sklearn'"
```bash
pip install scikit-learn
```

### Error: "Model file not found"
Make sure you've copied the `.pkl` files to this directory using the copy-models script.

### Port already in use
Change the port in `app.py`:
```python
app.run(host='0.0.0.0', port=5002, debug=True)  # Change 5001 to 5002
```

Then update `ML_SERVICE_URL` in backend `.env`:
```
ML_SERVICE_URL=http://localhost:5002
```

## Integration with Backend

The Node.js backend calls this service through `services/mlService.js`:

```javascript
const response = await axios.post('http://localhost:5001/predict', userData);
```

The predictions are then used by Gemini AI to generate detailed meal plans.
