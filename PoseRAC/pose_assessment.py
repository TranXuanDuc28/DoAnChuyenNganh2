import numpy as np

class FormEvaluator:
    """Đánh giá form/tư thế cho các bài tập"""
    
    def __init__(self, action_name):
        self.action_name = action_name
        self.form_scores = []
        
    def calculate_angle(self, a, b, c):
        """Tính góc giữa 3 điểm (a-b-c)"""
        a = np.array([a.x, a.y]) if hasattr(a, 'x') else np.array(a)
        b = np.array([b.x, b.y]) if hasattr(b, 'x') else np.array(b)
        c = np.array([c.x, c.y]) if hasattr(c, 'x') else np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    def evaluate_squat(self, landmarks):
        """Đánh giá tư thế Squat"""
        feedback = []
        score = 100.0
        
        # Landmarks mapping (MediaPipe Pose)
        left_hip = landmarks[23]
        right_hip = landmarks[24]
        left_knee = landmarks[25]
        right_knee = landmarks[26]
        left_ankle = landmarks[27]
        right_ankle = landmarks[28]
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        
        # 1. Knee Angle (Depth)
        left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
        knee_angle = (left_knee_angle + right_knee_angle) / 2
        
        if knee_angle < 50:
            feedback.append("⚠️ Squat quá sâu")
            score -= 10
        elif knee_angle > 150:
            feedback.append("⚠️ Hạ thấp hơn nữa")
            score -= 15
        elif knee_angle > 130:
            feedback.append("⚠️ Thêm chút độ sâu")
            score -= 5
            
        # 2. Back Straightness (Hip vs Shoulder alignment)
        # Simple check: horizontal deviation between hip center and shoulder center should be minimal
        hip_center_x = (left_hip.x + right_hip.x) / 2
        shoulder_center_x = (left_shoulder.x + right_shoulder.x) / 2
        back_lean = abs(hip_center_x - shoulder_center_x)
        
        if back_lean > 0.15: # Threshold normalized
            feedback.append("⚠️ Giữ lưng thẳng")
            score -= 15

        # 3. Feet Width
        shoulder_width = abs(left_shoulder.x - right_shoulder.x)
        feet_width = abs(left_ankle.x - right_ankle.x)
        if shoulder_width > 0:
            ratio = feet_width / shoulder_width
            if ratio < 1.0:
                 feedback.append("⚠️ Mở rộng chân")
                 score -= 5
        
        if score >= 85: feedback.insert(0, "✅ Tư thế tốt")
        
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_push_up(self, landmarks):
        """Đánh giá tư thế Push-up"""
        feedback = []
        score = 100.0
        
        left_shoulder = landmarks[11]
        left_elbow = landmarks[13]
        left_wrist = landmarks[15]
        right_shoulder = landmarks[12]
        right_elbow = landmarks[14]
        right_wrist = landmarks[16]
        
        # Elbow Angle
        left_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
        right_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
        avg_angle = (left_angle + right_angle) / 2
        
        if avg_angle < 50:
            feedback.append("⚠️ Hạ quá thấp")
            score -= 10
        elif avg_angle > 160:
            # Only feedback if supposed to be down phase? 
            # Static evaluation is hard without state machine. 
            pass 
            
        # Body Alignment (Shoulder-Hip-Ankle line)
        left_hip = landmarks[23]
        left_ankle = landmarks[27]
        body_angle = self.calculate_angle(left_shoulder, left_hip, left_ankle)
        
        if body_angle < 150:
             feedback.append("⚠️ Thẳng người (đừng võng lưng)")
             score -= 20
        
        if score >= 85: feedback.insert(0, "✅ Tư thế tốt")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_jumping_jack(self, landmarks):
        """Đánh giá Jumping Jack"""
        feedback = []
        score = 100.0
        
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        left_ankle = landmarks[27]
        right_ankle = landmarks[28]
        left_wrist = landmarks[15]
        right_wrist = landmarks[16]
        
        # 1. Leg Spread
        shoulder_width = abs(left_shoulder.x - right_shoulder.x) or 0.1
        leg_spread = abs(left_ankle.x - right_ankle.x)
        ratio = leg_spread / shoulder_width
        
        if ratio < 1.5:
             feedback.append("⚠️ Mở chân rộng hơn")
             score -= 10
             
        # 2. Arm Height
        # Wrists should be above shoulders
        avg_wrist_y = (left_wrist.y + right_wrist.y) / 2
        avg_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
        
        if avg_wrist_y > avg_shoulder_y: # Y increases downwards
             feedback.append("⚠️ Vung tay cao lên")
             score -= 15
             
        if score >= 85: feedback.insert(0, "✅ Tư thế tốt")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_front_raise(self, landmarks):
        """Đánh giá Front Raise (Nâng tạ trước)"""
        feedback = []
        score = 100.0
        
        # Check angle of arm relative to torso
        left_shoulder = landmarks[11]
        left_elbow = landmarks[13]
        left_hip = landmarks[23]
        
        # Shoulder Angle (Hip-Shoulder-Elbow)
        # 180 is arm down, 90 is arm forward
        angle = self.calculate_angle(left_hip, left_shoulder, left_elbow)
        
        if angle < 60: # Raising too high
             feedback.append("⚠️ Đừng nâng quá cao")
             score -= 10
        elif angle > 160: # Too low (resting)
             pass 
        elif angle > 110: # Between 110 and 160
             feedback.append("⚠️ Nâng cao ngang vai")
             score -= 10
             
        # Check elbow straightness
        left_wrist = landmarks[15]
        elbow_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
        if elbow_angle < 150:
             feedback.append("⚠️ Thẳng tay")
             score -= 10
             
        if score >= 85 and angle <= 110: feedback.insert(0, "✅ Tốt")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_pull_up(self, landmarks):
        """Đánh giá Pull Up"""
        feedback = []
        score = 100.0
        
        # Chin above bar check is hard without bar object.
        # Use Wrist vs Nose relative position
        nose = landmarks[0]
        left_wrist = landmarks[15]
        right_wrist = landmarks[16]
        avg_wrist_y = (left_wrist.y + right_wrist.y) / 2
        
        # In pull up, when up, nose should be close to or above wrists Y level
        # Note: Camera angles vary greatly.
        
        # Check symmetry
        wrist_diff = abs(left_wrist.y - right_wrist.y)
        if wrist_diff > 0.05:
            feedback.append("⚠️ Kéo đều 2 tay")
            score -= 10
            
        if score >= 90: feedback.insert(0, "✅ Cân đối")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_bench_press(self, landmarks):
        """Đánh giá Bench Press"""
        feedback = []
        score = 100.0
        
        left_elbow = landmarks[13]
        right_elbow = landmarks[14]
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        
        # Symmetry check
        elbow_diff = abs(left_elbow.y - right_elbow.y)
        if elbow_diff > 0.05:
             feedback.append("⚠️ Đẩy đều 2 tay")
             score -= 15
             
        if score >= 85: feedback.insert(0, "✅ Ổn định")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_situp(self, landmarks):
        """Đánh giá Sit Up"""
        feedback = []
        score = 100.0
        
        # Angle Hip-Knee-Ankle (Knees should be bent)
        left_hip = landmarks[23]
        left_knee = landmarks[25]
        left_ankle = landmarks[27]
        
        knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        if knee_angle > 160:
             feedback.append("⚠️ Cong đầu gối")
             score -= 10
             
        # Range of motion: Shoulder vs Hip
        # Top of situp: Shoulder Y near Hip Y (sitting up)
        # Bottom: Shoulder Y far from Hip Y (lying down)
        
        if score >= 90: feedback.insert(0, "✅ Form ổn")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}

    def evaluate_pommel_horse(self, landmarks):
        """Đánh giá Pommel Horse (Cơ bản)"""
        # Complex dynamic movement. Checking for straight legs and support.
        feedback = []
        score = 100.0
        
        left_knee = landmarks[25]
        right_knee = landmarks[26]
        left_hip = landmarks[23]
        
        # Leg Straightness (Knees not bent too much)
        left_leg_angle = self.calculate_angle(landmarks[23], landmarks[25], landmarks[27])
        if left_leg_angle < 140:
             feedback.append("⚠️ Thẳng chân")
             score -= 10
             
        if score >= 90: feedback.insert(0, "✅ Tốt")
        return {'score': max(0, round(score, 1)), 'feedback': feedback}


    def evaluate_form(self, landmarks):
        """Router đánh giá form dựa vào action name"""
        name = self.action_name
        
        if name == 'squat': return self.evaluate_squat(landmarks)
        elif name == 'push_up': return self.evaluate_push_up(landmarks)
        elif name == 'jump_jack': return self.evaluate_jumping_jack(landmarks)
        elif name == 'front_raise': return self.evaluate_front_raise(landmarks)
        elif name == 'pull_up': return self.evaluate_pull_up(landmarks)
        elif name == 'bench_pressing': return self.evaluate_bench_press(landmarks)
        elif name == 'situp': return self.evaluate_situp(landmarks)
        elif name == 'pommelhorse': return self.evaluate_pommel_horse(landmarks)
        
        return {'score': 0, 'feedback': []}
    
    def get_average_score(self):
        """Tính điểm trung bình"""
        if not self.form_scores:
            return 0
        return sum(self.form_scores) / len(self.form_scores)
