"""
PoseRAC Optimized - Tăng tốc độ xử lý video
Các tối ưu:
- Frame skipping
- Batch processing lớn hơn
- Giảm resolution
- Tối ưu evaluation interval
- Cache font rendering
- Multi-threaded frame reading
"""
import pandas as pd
import numpy as np
import cv2
from mediapipe.python.solutions import drawing_utils as mp_drawing
from mediapipe.python.solutions import pose as mp_pose
import torch
import argparse
from model import PoseRAC, Action_trigger
import gc
import os
from concurrent.futures import ThreadPoolExecutor
import queue
import time

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class TextRenderer:
    """Cache font để vẽ text nhanh hơn"""
    def __init__(self):
        self.fonts = {}
    
    def get_font(self, size=30):
        if size not in self.fonts:
            try:
                self.fonts[size] = ImageFont.truetype("arial.ttf", size)
            except:
                try:
                    self.fonts[size] = ImageFont.truetype(
                        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
                except:
                    self.fonts[size] = ImageFont.load_default()
        return self.fonts[size]
    
    def render(self, img, text, position, font_size=30, color=(255, 255, 255)):
        if not PIL_AVAILABLE:
            cv2.putText(img, text.encode('ascii', 'ignore').decode(), 
                       position, cv2.FONT_HERSHEY_SIMPLEX, 
                       font_size/30, color, 2, cv2.LINE_AA)
            return img
        
        img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        draw = ImageDraw.Draw(img_pil)
        font = self.get_font(font_size)
        draw.text(position, text, font=font, fill=color)
        return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)


class FormEvaluator:
    """Đánh giá form/tư thế cho các bài tập"""
    
    def __init__(self, action_name):
        self.action_name = action_name
        self.form_scores = []
        
    def calculate_angle(self, a, b, c):
        """Tính góc giữa 3 điểm (a-b-c)"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    def evaluate_squat(self, landmarks):
        """Đánh giá tư thế Squat - Tinh chỉnh thêm: Threshold linh hoạt hơn, ưu tiên hip drop"""
        feedback = []
        score = 100.0
        
        # Lấy điểm landmarks cho cả 2 bên
        left_hip = [landmarks[23].x, landmarks[23].y]
        left_knee = [landmarks[25].x, landmarks[25].y]
        left_ankle = [landmarks[27].x, landmarks[27].y]
        
        right_hip = [landmarks[24].x, landmarks[24].y]
        right_knee = [landmarks[26].x, landmarks[26].y]
        right_ankle = [landmarks[28].x, landmarks[28].y]
        
        left_shoulder = [landmarks[11].x, landmarks[11].y]
        right_shoulder = [landmarks[12].x, landmarks[12].y]
        
        # Tính góc gối trung bình 2 bên (góc nhỏ hơn = squat sâu hơn)
        left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
        knee_angle = (left_knee_angle + right_knee_angle) / 2
        
        # Threshold tinh chỉnh: Cho phép squat partial (góc >130 vẫn ok nếu hip drop tốt)
        # Chỉ phạt nặng nếu >150 (gần thẳng đứng)
        if knee_angle < 50:  # Quá sâu, có thể mất cân bằng
            feedback.append("⚠️ Squat quá sâu - Cẩn thận!")
            score -= 20
        elif knee_angle > 150:  # Chưa đủ sâu (gần đứng thẳng)
            feedback.append("⚠️ Squat chưa đủ sâu")
            score -= 15
        elif knee_angle > 130:  # Partial squat, phạt nhẹ
            feedback.append("⚠️ Thử squat sâu hơn để hiệu quả")
            score -= 5
        
        # Kiểm tra lưng thẳng: Trung bình x của hip vs shoulder (độ lệch nhỏ)
        avg_hip_x = (left_hip[0] + right_hip[0]) / 2
        avg_shoulder_x = (left_shoulder[0] + right_shoulder[0]) / 2
        back_deviation = abs(avg_hip_x - avg_shoulder_x)
        if back_deviation > 0.08:  # Giảm từ 0.15 để nhạy hơn
            feedback.append("⚠️ Giữ lưng thẳng hơn")
            score -= 15
        
        # Kiểm tra gối vượt mũi chân: Trung bình 2 bên (ankle x ≈ mũi chân)
        avg_knee_x = (left_knee[0] + right_knee[0]) / 2
        avg_ankle_x = (left_ankle[0] + right_ankle[0]) / 2
        knee_over_toe = avg_knee_x - avg_ankle_x
        if knee_over_toe > 0.08:  # Tăng threshold để tránh phạt nhầm wide stance
            feedback.append("⚠️ Gối hơi vượt mũi chân")
            score -= 10
        
        # Metric chính cho độ sâu: Hip drop ratio (ưu tiên hơn knee angle)
        avg_ankle_y = (left_ankle[1] + right_ankle[1]) / 2
        avg_shoulder_y = (left_shoulder[1] + right_shoulder[1]) / 2
        body_height = abs(avg_shoulder_y - avg_ankle_y)
        if body_height > 0.01:  # Tránh chia 0
            avg_hip_y = (left_hip[1] + right_hip[1]) / 2
            hip_drop = avg_hip_y - avg_shoulder_y  # >0 nếu hip thấp hơn shoulder
            hip_drop_ratio = hip_drop / body_height
            
            # Threshold linh hoạt: >=0.35 = deep squat (hip thấp ~35% body height)
            if hip_drop_ratio < 0.20:  # Chưa drop đủ (shallow squat)
                feedback.append("⚠️ Hạ hông thấp hơn")
                score -= 15
            elif hip_drop_ratio < 0.30:  # Partial, phạt nhẹ
                score -= 5
            # Nếu hip drop tốt, có thể bù trừ knee angle kém (nếu wide stance)
            if hip_drop_ratio >= 0.35 and knee_angle > 130:
                # Bỏ qua phạt knee nếu hip drop tốt
                pass
        else:
            hip_drop_ratio = 0
        
        # Kiểm tra độ rộng chân (cho sumo squat hoặc wide stance)
        shoulder_width = abs(left_shoulder[0] - right_shoulder[0])
        ankle_width = abs(left_ankle[0] - right_ankle[0])
        stance_ratio = ankle_width / shoulder_width if shoulder_width > 0.01 else 1
        if stance_ratio < 1.2:  # Chân quá hẹp
            feedback.append("⚠️ Mở chân rộng hơn cho ổn định")
            score -= 10
        
        # Đánh giá tổng: Nếu score cao, ưu tiên positive feedback
        if len(feedback) == 0 or score >= 85:
            feedback = ["✅ Tư thế tốt! Giữ nhịp độ này."]
        elif score >= 75:
            feedback.insert(0, "👍 Form khá - Tập trung độ sâu.")
        
        # Debug info (có thể log để kiểm tra)
        debug_info = {
            'knee_angle': round(knee_angle, 1),
            'hip_drop_ratio': round(hip_drop_ratio, 2),
            'back_deviation': round(back_deviation, 3),
            'knee_over_toe': round(knee_over_toe, 3),
            'stance_ratio': round(stance_ratio, 2)
        }
        
        return {
            'score': max(0, round(score, 1)), 
            'feedback': feedback,
            'debug': debug_info  # Để debug nếu cần
        }
    
    def evaluate_push_up(self, landmarks):
        """Đánh giá tư thế Push-up"""
        feedback = []
        score = 100.0
        
        shoulder = [landmarks[11].x, landmarks[11].y]
        elbow = [landmarks[13].x, landmarks[13].y]
        wrist = [landmarks[15].x, landmarks[15].y]
        hip = [landmarks[23].x, landmarks[23].y]
        
        elbow_angle = self.calculate_angle(shoulder, elbow, wrist)
        
        if elbow_angle < 60:
            feedback.append("Hạ quá thấp")
            score -= 10
        elif elbow_angle > 120:
            feedback.append("Chưa hạ đủ")
            score -= 15
        
        if score > 85:
            feedback.append("Tư thế tốt!")
        
        return {'score': max(0, score), 'feedback': feedback}
    
    # def evaluate_jumping_jack(self, landmarks):
    #     """Đánh giá tư thế Jumping Jack"""
    #     feedback = []
    #     score = 100.0

    #     left_ankle = landmarks[27]
    #     right_ankle = landmarks[28]
    #     left_wrist = landmarks[15]
    #     right_wrist = landmarks[16]
    #     nose = landmarks[0]

    #     body_height = abs(nose.y - (left_ankle.y + right_ankle.y) / 2)
    #     if body_height == 0:
    #         body_height = 1e-6

    #     leg_spread = abs(left_ankle.x - right_ankle.x) / body_height
    #     if leg_spread < 0.6:
    #         feedback.append("Mở chân rộng hơn")
    #         score -= 15

    #     avg_wrist_y = (left_wrist.y + right_wrist.y) / 2
    #     avg_shoulder_y = (landmarks[11].y + landmarks[12].y) / 2

    #     if avg_wrist_y > avg_shoulder_y - 0.05:
    #         feedback.append("Giơ tay cao hơn")
    #         score -= 20

    #     if score >= 85:
    #         feedback.append("✅ Tư thế tốt!")

    #     return {'score': max(0, score), 'feedback': feedback}
    def evaluate_jumping_jack(self, landmarks):
        """
        Đánh giá Jumping Jack với thuật toán tốt hơn
        """
        feedback = []
        score = 100.0

        # Lấy các điểm chính
        left_shoulder = landmarks[11]
        right_shoulder = landmarks[12]
        left_hip = landmarks[23]
        right_hip = landmarks[24]
        left_knee = landmarks[25]
        right_knee = landmarks[26]
        left_ankle = landmarks[27]
        right_ankle = landmarks[28]
        left_wrist = landmarks[15]
        right_wrist = landmarks[16]
        nose = landmarks[0]

        # --- CÁCH 1: Dùng độ rộng vai làm chuẩn (ổn định hơn) ---
        shoulder_width = abs(left_shoulder.x - right_shoulder.x)
        
        if shoulder_width < 0.01:  # Tránh chia 0
            shoulder_width = 0.1
        
        # Độ rộng chân so với vai
        leg_spread = abs(left_ankle.x - right_ankle.x)
        leg_spread_ratio = leg_spread / shoulder_width
        
        # Threshold mới: chân rộng ít nhất 2.5 lần vai
        # (Thay vì dùng chiều cao cơ thể không ổn định)
        if leg_spread_ratio < 2.3:  # Giảm từ 2.5 xuống 2.3 cho dễ hơn
            feedback.append("⚠️ Mở chân rộng hơn")
            score -= 15
        elif leg_spread_ratio < 2.0:  # Quá hẹp
            feedback.append("⚠️ Mở chân rộng hơn nhiều!")
            score -= 25

        # --- CÁCH 2: Kiểm tra góc chân (không phụ thuộc khoảng cách camera) ---
        # Tính góc giữa hip-knee-ankle (góc gối)
        def calculate_angle(a, b, c):
            a = np.array([a.x, a.y])
            b = np.array([b.x, b.y])
            c = np.array([c.x, c.y])
            
            radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
            angle = np.abs(radians*180.0/np.pi)
            
            if angle > 180.0:
                angle = 360 - angle
                
            return angle
        
        left_leg_angle = calculate_angle(left_hip, left_knee, left_ankle)
        right_leg_angle = calculate_angle(right_hip, right_knee, right_ankle)
        
        # Khi mở chân đủ rộng, góc gối phải > 160 độ (gần thẳng)
        avg_leg_angle = (left_leg_angle + right_leg_angle) / 2
        
        if avg_leg_angle < 150:
            feedback.append("⚠️ Duỗi chân thẳng")
            score -= 10

        # --- 3. Kiểm tra tay có giơ cao đủ không ---
        avg_wrist_y = (left_wrist.y + right_wrist.y) / 2
        avg_shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
        nose_y = nose.y

        # Cổ tay phải cao hơn vai (y nhỏ hơn vì trục y tăng từ trên xuống)
        wrist_lift = avg_shoulder_y - avg_wrist_y  # Giá trị dương = tay cao hơn vai
        
        # Chuẩn hóa theo khoảng cách mũi-vai
        head_shoulder_dist = abs(avg_shoulder_y - nose_y)
        if head_shoulder_dist < 0.01:
            head_shoulder_dist = 0.1
        
        wrist_lift_ratio = wrist_lift / head_shoulder_dist
        
        if wrist_lift_ratio < 0.5:  # Tay chưa cao hơn vai đủ (ít nhất 0.5x chiều cao đầu)
            feedback.append("⚠️ Giơ tay cao hơn")
            score -= 20
        elif wrist_lift_ratio < 0.3:
            feedback.append("⚠️ Giơ tay cao sát đầu!")
            score -= 30

        # --- 4. Độ đối xứng (tay trái & phải) ---
        wrist_symmetry = abs(left_wrist.y - right_wrist.y)
        symmetry_ratio = wrist_symmetry / head_shoulder_dist
        
        if symmetry_ratio > 0.15:  # 15% chiều cao đầu
            feedback.append("⚠️ Giữ cân đối 2 tay")
            score -= 10

        # --- 5. Kiểm tra tư thế đứng thẳng ---
        # Hip không được lệch quá nhiều so với vai
        hip_alignment = abs((left_hip.x + right_hip.x)/2 - (left_shoulder.x + right_shoulder.x)/2)
        
        if hip_alignment > 0.08:
            feedback.append("⚠️ Đứng thẳng")
            score -= 10

        # --- Đánh giá tổng quan ---
        if score >= 85:
            feedback = ["✅ Tư thế tốt!"]  # Override feedback cũ
        elif score >= 70:
            feedback.insert(0, "👍 Khá tốt")

        return {
            'score': max(0, round(score, 1)),
            'feedback': feedback,
            'leg_spread_ratio': round(leg_spread_ratio, 2),
            'avg_leg_angle': round(avg_leg_angle, 1),
            'wrist_lift_ratio': round(wrist_lift_ratio, 2),
            'symmetry_ratio': round(symmetry_ratio, 2)
        }

    def evaluate_form(self, landmarks):
        """Đánh giá form dựa vào loại bài tập"""
        if self.action_name == 'squat':
            return self.evaluate_squat(landmarks)
        elif self.action_name == 'push_up':
            return self.evaluate_push_up(landmarks)
        elif self.action_name == 'jump_jack':
            return self.evaluate_jumping_jack(landmarks)
        else:
            return {'score': 0, 'feedback': ['⚠️ Chưa hỗ trợ đánh giá']}
    
    def get_average_score(self):
        """Tính điểm trung bình"""
        if not self.form_scores:
            return 0
        return sum(self.form_scores) / len(self.form_scores)


def normalize_landmarks(all_landmarks):
    """Chuẩn hóa pose landmarks"""
    x_max = np.expand_dims(np.max(all_landmarks[:, :, 0], axis=1), 1)
    x_min = np.expand_dims(np.min(all_landmarks[:, :, 0], axis=1), 1)
    y_max = np.expand_dims(np.max(all_landmarks[:, :, 1], axis=1), 1)
    y_min = np.expand_dims(np.min(all_landmarks[:, :, 1], axis=1), 1)
    z_max = np.expand_dims(np.max(all_landmarks[:, :, 2], axis=1), 1)
    z_min = np.expand_dims(np.min(all_landmarks[:, :, 2], axis=1), 1)
    
    all_landmarks[:, :, 0] = (all_landmarks[:, :, 0] - x_min) / (x_max - x_min + 1e-9)
    all_landmarks[:, :, 1] = (all_landmarks[:, :, 1] - y_min) / (y_max - y_min + 1e-9)
    all_landmarks[:, :, 2] = (all_landmarks[:, :, 2] - z_min) / (z_max - z_min + 1e-9)
    
    all_landmarks = all_landmarks.reshape(len(all_landmarks), -1)
    return all_landmarks


def create_simple_graph(history, width, height):
    """Tạo graph confidence"""
    graph_width = int(width * 0.35)
    graph_height = int(height * 0.2)
    
    graph = np.zeros((graph_height, graph_width, 3), dtype=np.uint8)
    
    if len(history) < 2:
        return graph
    
    data = history[-min(100, len(history)):]
    cv2.rectangle(graph, (0, 0), (graph_width-1, graph_height-1), (100, 100, 100), 1)
    
    points = []
    for i, val in enumerate(data):
        x = int((i / len(data)) * graph_width)
        y = int((1 - val) * graph_height)
        y = max(0, min(graph_height-1, y))
        points.append((x, y))
    
    if len(points) > 1:
        pts = np.array(points, np.int32)
        cv2.polylines(graph, [pts], False, (33, 150, 243), 2)
    
    return graph


def inference_optimized(video_path, output_path=None, 
                       model_path='best_weights_PoseRAC.pth',
                       enter_threshold=0.78, exit_threshold=0.4, 
                       momentum=0.4, use_gpu=True,
                       frame_skip=2, target_width=640, eval_interval=20):
    """
    Inference tối ưu với các cải tiến tốc độ
    
    Args:
        frame_skip: Xử lý 1/N frames (2 = xử lý nửa số frame)
        target_width: Độ rộng target (640 nhanh hơn 1280)
        eval_interval: Đánh giá form mỗi N frames
    """
    
    start_time = time.time()
    
    # Setup device
    device = 'cpu'
    if use_gpu and torch.cuda.is_available():
        device = 'cuda'
        print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
    else:
        print(f"⚠️  CPU mode")
    
    # Auto-generate output path
    if output_path is None:
        base_name = os.path.splitext(os.path.basename(video_path))[0]
        output_dir = os.path.dirname(video_path)
        output_path = os.path.join(output_dir, f"{base_name}_fast.mp4")
    
    # Load action labels
    label_pd = pd.read_csv('all_action.csv')
    index2action = {}
    for _, row in label_pd.iterrows():
        index2action[row['label']] = row['action']
    num_classes = len(index2action)
    
    print(f"Actions: {list(index2action.values())}")
    
    # Load model
    print(f"Loading model: {model_path}")
    model = PoseRAC(None, None, None, None, dim=99, heads=9,
                    enc_layer=6, learning_rate=0.001,
                    seed=42, num_classes=num_classes, alpha=0.01)
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model.to(device)
    
    print(f"\n{'='*60}")
    print(f"OPTIMIZED MODE: skip={frame_skip}, width={target_width}")
    print(f"{'='*60}")
    
    video_cap = cv2.VideoCapture(video_path)
    fps = int(video_cap.get(cv2.CAP_PROP_FPS))
    width = int(video_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Resize
    if width > target_width:
        scale = target_width / width
        width = target_width
        height = int(height * scale)
    
    print(f"Video: {width}x{height} @ {fps}fps, {total_frames} frames")
    print(f"Will process: {total_frames // frame_skip} frames")
    
    # MediaPipe với static mode (nhanh hơn)
    pose_tracker = mp_pose.Pose(
        static_image_mode=True,  # Tắt tracking
        model_complexity=0,
        min_detection_confidence=0.3,  # Giảm threshold
        min_tracking_confidence=0.3
    )
    
    all_landmarks = []
    all_landmarks_raw = []
    frame_count = 0
    processed_count = 0
    
    print("\n[1/4] Extracting poses...")
    
    while True:
        success, frame = video_cap.read()
        if not success:
            break
        
        frame_count += 1
        
        # Skip frames
        if frame_count % frame_skip != 0:
            if all_landmarks:
                all_landmarks.append(all_landmarks[-1])
                all_landmarks_raw.append(all_landmarks_raw[-1])
            else:
                all_landmarks.append([0.0] * 99)
                all_landmarks_raw.append(None)
            continue
        
        processed_count += 1
        if processed_count % 50 == 0:
            print(f"  {processed_count}/{total_frames//frame_skip}...", end='\r')
        
        if frame.shape[1] > target_width:
            frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose_tracker.process(image=frame_rgb)
        
        if result.pose_landmarks:
            landmarks = []
            for landmark in result.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            all_landmarks.append(landmarks)
            all_landmarks_raw.append(result.pose_landmarks)
        else:
            all_landmarks.append([0.0] * 99)
            all_landmarks_raw.append(None)
    
    video_cap.release()
    pose_tracker.close()
    print(f"\n  ✅ Extracted {len(all_landmarks)} poses")
    
    # Normalize
    poses = np.array(all_landmarks, dtype=np.float32).reshape(-1, 33, 3)
    poses = normalize_landmarks(poses)
    
    del all_landmarks
    gc.collect()
    
    print("\n[2/4] Model inference...")
    
    poses_tensor = torch.from_numpy(poses).float().to(device)
    
    # Batch size lớn hơn
    batch_size = 256 if device == 'cuda' else 128
    
    with torch.no_grad():
        all_output = []
        
        for i in range(0, len(poses_tensor), batch_size):
            batch = poses_tensor[i:i+batch_size]
            output = torch.sigmoid(model(batch))
            all_output.append(output.cpu())
            
            if i % (batch_size * 3) == 0:
                print(f"  Batch {i}/{len(poses_tensor)}...", end='\r')
        
        all_output = torch.cat(all_output, dim=0)
    
    print(f"\n  ✅ Inference done")
    
    if device == 'cuda':
        torch.cuda.empty_cache()
    del poses_tensor, poses
    gc.collect()
    
    print("\n[3/4] Analyzing actions...")
    
    # Find best action (same as before)
    best_action_index = -1
    best_action_name = None
    best_count = -1
    best_avg_conf = -1
    
    for action_index in index2action:
        action_name = index2action[action_index]
        
        repetition_salient_1 = Action_trigger(
            action_name=action_name,
            enter_threshold=enter_threshold,
            exit_threshold=exit_threshold
        )
        repetition_salient_2 = Action_trigger(
            action_name=action_name,
            enter_threshold=enter_threshold,
            exit_threshold=exit_threshold
        )
        
        classify_prob = 0.5
        pose_count = 0
        curr_pose = 'holder'
        init_pose = 'pose_holder'
        total_conf = 0
        
        for output in all_output:
            output_numpy = output[action_index].numpy()
            classify_prob = output_numpy * (1.0 - momentum) + momentum * classify_prob
            total_conf += output_numpy
            
            salient1_triggered = repetition_salient_1(classify_prob)
            reverse_classify_prob = 1 - classify_prob
            salient2_triggered = repetition_salient_2(reverse_classify_prob)
            
            if init_pose == 'pose_holder':
                if salient1_triggered:
                    init_pose = 'salient1'
                elif salient2_triggered:
                    init_pose = 'salient2'
            
            if init_pose == 'salient1':
                if curr_pose == 'salient1' and salient2_triggered:
                    pose_count += 1
            else:
                if curr_pose == 'salient2' and salient1_triggered:
                    pose_count += 1
            
            if salient1_triggered:
                curr_pose = 'salient1'
            elif salient2_triggered:
                curr_pose = 'salient2'
        
        avg_conf = total_conf / len(all_output)
        print(f"  {action_name}: {pose_count} reps (conf: {avg_conf:.3f})")
        
        if pose_count > best_count or (pose_count == best_count and avg_conf > best_avg_conf):
            best_count = pose_count
            best_action_index = action_index
            best_action_name = action_name
            best_avg_conf = avg_conf
    
    if best_count == 0:
        for action_index in index2action:
            total_conf = sum(all_output[:, action_index].numpy()) / len(all_output)
            if total_conf > best_avg_conf:
                best_action_index = action_index
                best_action_name = index2action[action_index]
                best_avg_conf = total_conf
    
    print(f"\n  ✅ Best: {best_action_name} ({best_count} reps)")
    
    print("\n[4/4] Rendering video...")
    
    # Initialize
    form_evaluator = FormEvaluator(best_action_name)
    text_renderer = TextRenderer()
    
    video_cap = cv2.VideoCapture(video_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    pose_tracker = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=0,
        min_detection_confidence=0.3,
        min_tracking_confidence=0.3
    )
    
    repetition_salient_1 = Action_trigger(
        action_name=best_action_name,
        enter_threshold=enter_threshold,
        exit_threshold=exit_threshold
    )
    repetition_salient_2 = Action_trigger(
        action_name=best_action_name,
        enter_threshold=enter_threshold,
        exit_threshold=exit_threshold
    )
    
    classify_prob = 0.5
    pose_count = 0
    curr_pose = 'holder'
    init_pose = 'pose_holder'
    history = []
    
    frame_idx = 0
    current_feedback = []
    current_form_score = 0
    
    while True:
        success, frame = video_cap.read()
        if not success or frame_idx >= len(all_output):
            break
        
        if frame.shape[1] > target_width:
            frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)
        
        frame_idx += 1
        if frame_idx % 50 == 0:
            print(f"  {frame_idx}/{len(all_output)}...", end='\r')
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose_tracker.process(image=frame_rgb)
        
        output = all_output[frame_idx - 1]
        output_numpy = output[best_action_index].numpy()
        classify_prob = output_numpy * (1.0 - momentum) + momentum * classify_prob
        
        history.append(float(classify_prob))
        
        # Count reps
        salient1_triggered = repetition_salient_1(classify_prob)
        reverse_classify_prob = 1 - classify_prob
        salient2_triggered = repetition_salient_2(reverse_classify_prob)
        
        if init_pose == 'pose_holder':
            if salient1_triggered:
                init_pose = 'salient1'
            elif salient2_triggered:
                init_pose = 'salient2'
        
        if init_pose == 'salient1':
            if curr_pose == 'salient1' and salient2_triggered:
                pose_count += 1
        else:
            if curr_pose == 'salient2' and salient1_triggered:
                pose_count += 1
        
        if salient1_triggered:
            curr_pose = 'salient1'
        elif salient2_triggered:
            curr_pose = 'salient2'
        
        # Evaluate form (less frequently)
        if result.pose_landmarks and frame_idx % eval_interval == 0:
            eval_result = form_evaluator.evaluate_form(result.pose_landmarks.landmark)
            current_form_score = eval_result['score']
            current_feedback = eval_result['feedback']
            form_evaluator.form_scores.append(current_form_score)
        
        # Draw skeleton
        if result.pose_landmarks:
            mp_drawing.draw_landmarks(
                image=frame,
                landmark_list=result.pose_landmarks,
                connections=mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing.DrawingSpec(
                    color=(0, 255, 0), thickness=2, circle_radius=2),
                connection_drawing_spec=mp_drawing.DrawingSpec(
                    color=(255, 255, 255), thickness=2)
            )
        
        # Add graph (less frequently)
        if frame_idx % 10 == 0 and len(history) > 1:
            graph = create_simple_graph(history, width, height)
            x, y = int(width * 0.02), int(height * 0.02)
            h, w = graph.shape[:2]
            
            roi = frame[y:y+h, x:x+w]
            if roi.shape[:2] == graph.shape[:2]:
                frame[y:y+h, x:x+w] = cv2.addWeighted(roi, 0.4, graph, 0.6, 0)
        
        # Text rendering with cache
        frame = text_renderer.render(frame, f"Số lần: {pose_count}", 
                                     (width - 250, 30), font_size=35, color=(0, 0, 255))
        
        frame = text_renderer.render(frame, f"Bài tập: {best_action_name}", 
                                     (20, height - 150), font_size=30, color=(255, 0, 0))
        
        frame = text_renderer.render(frame, f"Độ tin cậy: {classify_prob:.2f}", 
                                     (20, height - 110), font_size=24, color=(0, 255, 0))
        
        score_color = (0, 255, 0) if current_form_score >= 85 else \
                     (0, 255, 255) if current_form_score >= 70 else (0, 0, 255)
        
        frame = text_renderer.render(frame, f"Điểm: {current_form_score:.0f}/100", 
                                     (width - 250, 80), font_size=30, color=score_color)
        
        y_offset = height - 70
        for feedback_text in current_feedback[:3]:
            frame = text_renderer.render(frame, feedback_text, 
                                        (20, y_offset), font_size=22, color=(255, 255, 0))
            y_offset += 30
        
        out_video.write(frame)
    
    video_cap.release()
    out_video.release()
    pose_tracker.close()
    
    avg_form_score = form_evaluator.get_average_score()
    
    elapsed_time = time.time() - start_time
    fps_processed = len(all_output) / elapsed_time
    
    print(f"\n  ✅ Video saved!")
    
    print(f"\n{'='*60}")
    print("RESULT")
    print(f"{'='*60}")
    print(f"Action: {best_action_name}")
    print(f"Repetitions: {best_count}")
    print(f"Average Form Score: {avg_form_score:.1f}/100")
    
    if avg_form_score >= 85:
        print(f"Form Quality: Excellent ⭐⭐⭐")
    elif avg_form_score >= 70:
        print(f"Form Quality: Good ⭐⭐")
    else:
        print(f"Form Quality: Need Improvement ⭐")
    
    print(f"\nProcessing Time: {elapsed_time:.1f}s")
    print(f"Speed: {fps_processed:.1f} fps")
    print(f"Speedup: {frame_skip}x (frame skip)")
    print(f"Output: {output_path}")
    print(f"{'='*60}")
    
    return {
        'action_type': best_action_name,
        'repetition_count': best_count,
        'average_form_score': avg_form_score,
        'output_video': output_path,
        'processing_time': elapsed_time,
        'fps': fps_processed
    }


def main():
    parser = argparse.ArgumentParser(description='PoseRAC Optimized - Fast Processing')
    parser.add_argument('--video', type=str, required=True, help='Video input')
    parser.add_argument('--output', type=str, default=None, help='Video output')
    parser.add_argument('--model', type=str, default='best_weights_PoseRAC.pth')
    parser.add_argument('--cpu', action='store_true', help='Force CPU')
    parser.add_argument('--enter_threshold', type=float, default=0.78)
    parser.add_argument('--exit_threshold', type=float, default=0.4)
    parser.add_argument('--momentum', type=float, default=0.4)
    
    # Optimization parameters
    parser.add_argument('--frame_skip', type=int, default=1, 
                       help='Process every Nth frame (2=half frames, 3=1/3 frames)')
    parser.add_argument('--width', type=int, default=1280,
                       help='Target width (640, 854, 1280)')
    parser.add_argument('--eval_interval', type=int, default=10,
                       help='Evaluate form every N frames')
    
    args = parser.parse_args()
    
    print("="*60)
    print("POSERAC OPTIMIZED - FAST PROCESSING")
    print("="*60)
    print(f"Frame skip: {args.frame_skip}x")
    print(f"Target width: {args.width}px")
    print(f"Eval interval: every {args.eval_interval} frames")
    print("="*60)
    
    result = inference_optimized(
        video_path=args.video,
        output_path=args.output,
        model_path=args.model,
        enter_threshold=args.enter_threshold,
        exit_threshold=args.exit_threshold,
        momentum=args.momentum,
        use_gpu=not args.cpu,
        frame_skip=args.frame_skip,
        target_width=args.width,
        eval_interval=args.eval_interval
    )
    
    print(f"\n✅ Processing completed in {result['processing_time']:.1f}s")
    print(f"   Speed: {result['fps']:.1f} fps")


if __name__ == "__main__":
    main()