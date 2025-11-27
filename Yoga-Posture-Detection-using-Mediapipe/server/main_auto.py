import cv2
import mediapipe as mp
import numpy as np
import math
import sys
import json
import os
from scipy import spatial
import base64
import io
from pose_classifier_ml import PoseClassifierML as PoseClassifier

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Khởi tạo MediaPipe
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

class PoseEvaluator:
    """Lớp đánh giá tư thế tập luyện"""
    
    def __init__(self, reference_image_path):
        """
        Khởi tạo với ảnh tư thế mẫu
        Args:
            reference_image_path: Đường dẫn đến ảnh tư thế chuẩn
        """
        self.reference_landmarks, self.reference_keypoints, self.reference_angles, self.reference_image = \
            self.extract_keypoints(reference_image_path)
    
    @staticmethod
    def calculate_angle(a, b, c):
        """Tính góc tại điểm b giữa 3 điểm a-b-c"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - \
                  np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
        return angle
    
    def extract_keypoints(self, image_path):
        """Trích xuất các điểm khớp và góc từ ảnh"""
        image = cv2.imread(image_path)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        with mp_pose.Pose(min_detection_confidence=0.5, 
                         min_tracking_confidence=0.5) as pose:
            results = pose.process(image_rgb)
            
            if not results.pose_landmarks:
                raise ValueError("Khong phat hien duoc tu the trong anh!")
            
            landmarks = results.pose_landmarks.landmark
            h, w, _ = image.shape
            
            # Lấy tọa độ các khớp quan trọng
            joints = {
                'right_shoulder': [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                                  landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y],
                'right_elbow': [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y],
                'right_wrist': [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y],
                'left_shoulder': [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                                 landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y],
                'left_elbow': [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y],
                'left_wrist': [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y],
                'right_hip': [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                             landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y],
                'right_knee': [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                              landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y],
                'right_ankle': [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                               landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y],
                'left_hip': [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y],
                'left_knee': [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                             landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y],
                'left_ankle': [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                              landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            }
            
            # Tính các góc quan trọng
            angles = [
                self.calculate_angle(joints['right_shoulder'], joints['right_elbow'], joints['right_wrist']),
                self.calculate_angle(joints['left_shoulder'], joints['left_elbow'], joints['left_wrist']),
                self.calculate_angle(joints['right_elbow'], joints['right_shoulder'], joints['right_hip']),
                self.calculate_angle(joints['left_elbow'], joints['left_shoulder'], joints['left_hip']),
                self.calculate_angle(joints['right_shoulder'], joints['right_hip'], joints['right_knee']),
                self.calculate_angle(joints['left_shoulder'], joints['left_hip'], joints['left_knee']),
                self.calculate_angle(joints['right_hip'], joints['right_knee'], joints['right_ankle']),
                self.calculate_angle(joints['left_hip'], joints['left_knee'], joints['left_ankle'])
            ]
            
            # Tạo danh sách keypoints
            keypoints = [{'X': lm.x, 'Y': lm.y, 'Z': lm.z} for lm in landmarks]
            
            # Vẽ skeleton lên ảnh
            image_annotated = image.copy()
            mp_drawing.draw_landmarks(
                image_annotated, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=4, circle_radius=2),
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=4, circle_radius=2)
            )
            
            return landmarks, keypoints, angles, image_annotated
    
    def compare_poses(self, current_landmarks, current_angles, image):
        """So sánh tư thế hiện tại với tư thế mẫu"""
        feedback = []
        angle_names = [
            "Khuyu tay phai", "Khuyu tay trai",
            "Vai phai", "Vai trai",
            "Hong phai", "Hong trai",
            "Dau goi phai", "Dau goi trai"
        ]
        
        threshold = 15  # Ngưỡng sai số cho phép (độ)
        
        for i, (current, reference) in enumerate(zip(current_angles, self.reference_angles)):
            diff = current - reference
            
            if abs(diff) > threshold:
                if diff < 0:
                    msg = f"{angle_names[i]}: Mo rong them {abs(diff):.0f}°"
                else:
                    msg = f"{angle_names[i]}: Co lai {abs(diff):.0f}°"
                feedback.append(msg)
        
        # Tính điểm dựa trên độ chính xác
        angle_diffs = [abs(c - r) for c, r in zip(current_angles, self.reference_angles)]
        avg_diff = np.mean(angle_diffs)
        score = max(0, 100 - avg_diff * 2)  # Mỗi độ sai lệch trừ 2 điểm
        
        return score, feedback

    def evaluate_static_image(self, test_image_path, save_result=True, output_path="result.jpg"):
        """
        Đánh giá tư thế từ một ảnh tĩnh
        Args:
            test_image_path: Đường dẫn ảnh cần đánh giá
            save_result: Có lưu kết quả không (mặc định True)
            output_path: Đường dẫn lưu ảnh kết quả
        Returns:
            score: Điểm đánh giá (0-100)
            feedback: Danh sách phản hồi
            result_image: Ảnh kết quả với annotations
        """
        image = cv2.imread(test_image_path)
        if image is None:
            raise ValueError(f"Khong the doc anh: {test_image_path}")
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        with mp_pose.Pose(min_detection_confidence=0.5,
                         min_tracking_confidence=0.5) as pose:
            results = pose.process(image_rgb)
            
            if not results.pose_landmarks:
                return None, ["Khong phat hien dc nguoi trong anh"], image
            
            landmarks = results.pose_landmarks.landmark
            
            # Lấy tọa độ các khớp
            joints = {}
            for name, idx in [
                ('right_shoulder', mp_pose.PoseLandmark.RIGHT_SHOULDER.value),
                ('right_elbow', mp_pose.PoseLandmark.RIGHT_ELBOW.value),
                ('right_wrist', mp_pose.PoseLandmark.RIGHT_WRIST.value),
                ('left_shoulder', mp_pose.PoseLandmark.LEFT_SHOULDER.value),
                ('left_elbow', mp_pose.PoseLandmark.LEFT_ELBOW.value),
                ('left_wrist', mp_pose.PoseLandmark.LEFT_WRIST.value),
                ('right_hip', mp_pose.PoseLandmark.RIGHT_HIP.value),
                ('right_knee', mp_pose.PoseLandmark.RIGHT_KNEE.value),
                ('right_ankle', mp_pose.PoseLandmark.RIGHT_ANKLE.value),
                ('left_hip', mp_pose.PoseLandmark.LEFT_HIP.value),
                ('left_knee', mp_pose.PoseLandmark.LEFT_KNEE.value),
                ('left_ankle', mp_pose.PoseLandmark.LEFT_ANKLE.value)
            ]:
                joints[name] = [landmarks[idx].x, landmarks[idx].y]
            
            # Tính góc
            current_angles = [
                self.calculate_angle(joints['right_shoulder'], joints['right_elbow'], joints['right_wrist']),
                self.calculate_angle(joints['left_shoulder'], joints['left_elbow'], joints['left_wrist']),
                self.calculate_angle(joints['right_elbow'], joints['right_shoulder'], joints['right_hip']),
                self.calculate_angle(joints['left_elbow'], joints['left_shoulder'], joints['left_hip']),
                self.calculate_angle(joints['right_shoulder'], joints['right_hip'], joints['right_knee']),
                self.calculate_angle(joints['left_shoulder'], joints['left_hip'], joints['left_knee']),
                self.calculate_angle(joints['right_hip'], joints['right_knee'], joints['right_ankle']),
                self.calculate_angle(joints['left_hip'], joints['left_knee'], joints['left_ankle'])
            ]
            
            # Vẽ skeleton
            result_image = image.copy()
            mp_drawing.draw_landmarks(
                result_image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=4, circle_radius=4),
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=3, circle_radius=3)
            )
            
            # So sánh và vẽ phản hồi
            score, feedback = self.compare_poses(landmarks, current_angles, result_image)
            
            # Lưu kết quả
            if save_result:
                cv2.imwrite(output_path, result_image)
            
            return score, feedback, result_image
            
    def create_comparison_view(self, test_image_path, output_path="comparison.jpg"):
        """
        Tạo ảnh so sánh giữa tư thế mẫu và tư thế test
        Args:
            test_image_path: Đường dẫn ảnh test
            output_path: Đường dẫn lưu ảnh so sánh
        """
        score, feedback, test_result = self.evaluate_static_image(test_image_path, save_result=False)
        
        if score is None:
            return None
        
        # Resize để cùng chiều cao
        h1, w1 = self.reference_image.shape[:2]
        h2, w2 = test_result.shape[:2]
        target_height = 600
        
        ref_resized = cv2.resize(self.reference_image, (int(w1 * target_height / h1), target_height))
        test_resized = cv2.resize(test_result, (int(w2 * target_height / h2), target_height))
        
        # Resize để cùng chiều rộng
        h1, w1 = self.reference_image.shape[:2]
        h2, w2 = test_result.shape[:2]
        target_width = 600

        ref_resized = cv2.resize(self.reference_image, (target_width, int(h1 * target_width / w1)))
        test_resized = cv2.resize(test_result, (target_width, int(h2 * target_width / w2)))
        

        # Ghép dọc
        comparison = np.vstack([ref_resized, test_resized])
        
        # Thêm text
        cv2.putText(
            comparison,
            'TU THE MAU',
            (20, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 255, 0),
            3
        )

        # Text cho ảnh dưới
        cv2.putText(
            comparison,
            'TU THE CUA BAN',
            (20, ref_resized.shape[0] + 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.5,
            (0, 0, 255),
            3
        )

        # Lưu ảnh
        cv2.imwrite(output_path, comparison)
        
        return comparison

def image_to_base64(image):
    """Chuyển đổi ảnh OpenCV sang chuỗi base64"""
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')

# Main execution
if __name__ == "__main__":
    # Argument parsing
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "message": "Missing image path argument"}))
        sys.exit(0)

    image_path = sys.argv[1]
    
    # Step 1: Auto-detect pose using PoseClassifier
    try:
        classifier = PoseClassifier()
        classification_result = classifier.classify_pose(image_path)
        
        if not classification_result.get("success"):
            print(json.dumps({
                "success": False, 
                "message": classification_result.get("message", "Could not detect pose")
            }))
            sys.exit(0)
        
        # Get detected pose information
        detected_pose = classification_result["pose_name"]
        pose_info = classification_result["pose_info"]
        confidence = classification_result["confidence"]
        reference_image = classification_result["reference_image"]
        
    except Exception as e:
        print(json.dumps({"success": False, "message": f"Pose detection error: {str(e)}"}))
        sys.exit(0)

    # Step 2: Evaluate pose accuracy
    try:
        evaluator = PoseEvaluator(reference_image)
        
        score, feedback, result = evaluator.evaluate_static_image(
            image_path, 
            save_result=True,
            output_path="pose_result.jpg"
        )
        comparison = evaluator.create_comparison_view(
            image_path, 
            output_path="comparison.jpg"
        )
        
        if score is not None:
            # Encode images to base64
            result_base64 = image_to_base64(result)
            reference_base64 = image_to_base64(evaluator.reference_image)
            comparison_base64 = image_to_base64(comparison) if comparison is not None else ""

            response = {
                "success": True,
                "detected_pose": detected_pose,
                "pose_name": pose_info["name"],
                "pose_name_vi": pose_info["name_vi"],
                "confidence": float(confidence),
                "score": float(score),
                "feedback": feedback,
                "isCorrect": bool(score >= 80),
                "result_image": f"data:image/jpeg;base64,{result_base64}",
                "reference_image": f"data:image/jpeg;base64,{reference_base64}",
                "comparison_image": f"data:image/jpeg;base64,{comparison_base64}" if comparison_base64 else None
            }
            print(json.dumps(response, ensure_ascii=False))
        else:
            print(json.dumps({
                "success": True, 
                "detected_pose": detected_pose,
                "pose_name": pose_info["name"],
                "pose_name_vi": pose_info["name_vi"],
                "confidence": float(confidence),
                "score": 0, 
                "feedback": feedback,
                "isCorrect": False,
                "result_image": None,
                "reference_image": None,
                "comparison_image": None
            }))
            
    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}))
        sys.exit(0)
