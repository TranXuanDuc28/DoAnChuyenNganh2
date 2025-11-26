from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load models and encoders
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'Personalized-Health-and-Fitness-Recommendation-System', 'Pycharm Files')
rf_exercises = joblib.load(os.path.join(MODEL_PATH, 'rf_exercises_model.pkl'))
rf_diet = joblib.load(os.path.join(MODEL_PATH, 'rf_diet_model.pkl'))
label_encoders = joblib.load(os.path.join(MODEL_PATH, 'label_encoders.pkl'))

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'AI Service is running'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract user data
        sex = data.get('sex')  # 'Male' or 'Female'
        age = int(data.get('age'))
        height = float(data.get('height'))  # in cm
        weight = float(data.get('weight'))  # in kg
        hypertension = data.get('hypertension', 'No')  # 'Yes' or 'No'
        diabetes = data.get('diabetes', 'No')  # 'Yes' or 'No'
        
        # Calculate BMI
        bmi = weight / ((height / 100) ** 2)
        
        # Determine Level based on BMI
        if bmi < 18.5:
            level = 'Underweight'
        elif 18.5 <= bmi < 25:
            level = 'Normal'
        elif 25 <= bmi < 30:
            level = 'Overweight'
        else:
            level = 'Obuse'  # Note: keeping original spelling from training data
        
        # Get fitness goal and type from user data
        fitness_goal = data.get('fitnessGoal', 'Weight Loss')  # 'Weight Loss' or 'Weight Gain'
        fitness_type = data.get('fitnessType', 'Cardio Fitness')  # 'Cardio Fitness' or 'Muscular Fitness'
        
        # Encode categorical features
        sex_encoded = label_encoders['Sex'].transform([sex])[0]
        hypertension_encoded = label_encoders['Hypertension'].transform([hypertension])[0]
        diabetes_encoded = label_encoders['Diabetes'].transform([diabetes])[0]
        level_encoded = label_encoders['Level'].transform([level])[0]
        fitness_goal_encoded = label_encoders['Fitness Goal'].transform([fitness_goal])[0]
        fitness_type_encoded = label_encoders['Fitness Type'].transform([fitness_type])[0]
        
        # Create feature vector
        user_features = [
            sex_encoded,
            age,
            height,
            weight,
            bmi,
            hypertension_encoded,
            diabetes_encoded,
            level_encoded,
            fitness_goal_encoded,
            fitness_type_encoded
        ]
        
        # Predict Exercise
        exercise_prediction = rf_exercises.predict([user_features])[0]
        exercise_result = label_encoders['Exercises'].inverse_transform([exercise_prediction])[0]
        
        # Predict Diet
        diet_prediction = rf_diet.predict([user_features])[0]
        diet_result = label_encoders['Diet'].inverse_transform([diet_prediction])[0]
        
        return jsonify({
            'success': True,
            'data': {
                'exercise': exercise_result,
                'diet': diet_result,
                'bmi': round(bmi, 2),
                'level': level,
                'userInfo': {
                    'sex': sex,
                    'age': age,
                    'height': height,
                    'weight': weight,
                    'hypertension': hypertension,
                    'diabetes': diabetes,
                    'fitnessGoal': fitness_goal,
                    'fitnessType': fitness_type
                }
            }
        })
        
    except KeyError as ke:
        return jsonify({
            'success': False,
            'error': f'Missing or invalid key: {str(ke)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """Predict for multiple users"""
    try:
        users = request.json.get('users', [])
        results = []
        
        for user_data in users:
            # Reuse the predict logic
            response = predict_single_user(user_data)
            results.append(response)
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def predict_single_user(data):
    """Helper function to predict for a single user"""
    sex = data.get('sex')
    age = int(data.get('age'))
    height = float(data.get('height'))
    weight = float(data.get('weight'))
    hypertension = data.get('hypertension', 'No')
    diabetes = data.get('diabetes', 'No')
    
    bmi = weight / ((height / 100) ** 2)
    
    if bmi < 18.5:
        level = 'Underweight'
    elif 18.5 <= bmi < 25:
        level = 'Normal'
    elif 25 <= bmi < 30:
        level = 'Overweight'
    else:
        level = 'Obuse'
    
    fitness_goal = data.get('fitnessGoal', 'Weight Loss')
    fitness_type = data.get('fitnessType', 'Cardio Fitness')
    
    sex_encoded = label_encoders['Sex'].transform([sex])[0]
    hypertension_encoded = label_encoders['Hypertension'].transform([hypertension])[0]
    diabetes_encoded = label_encoders['Diabetes'].transform([diabetes])[0]
    level_encoded = label_encoders['Level'].transform([level])[0]
    fitness_goal_encoded = label_encoders['Fitness Goal'].transform([fitness_goal])[0]
    fitness_type_encoded = label_encoders['Fitness Type'].transform([fitness_type])[0]
    
    user_features = [
        sex_encoded, age, height, weight, bmi,
        hypertension_encoded, diabetes_encoded, level_encoded,
        fitness_goal_encoded, fitness_type_encoded
    ]
    
    exercise_prediction = rf_exercises.predict([user_features])[0]
    exercise_result = label_encoders['Exercises'].inverse_transform([exercise_prediction])[0]
    
    diet_prediction = rf_diet.predict([user_features])[0]
    diet_result = label_encoders['Diet'].inverse_transform([diet_prediction])[0]
    
    return {
        'exercise': exercise_result,
        'diet': diet_result,
        'bmi': round(bmi, 2),
        'level': level
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

