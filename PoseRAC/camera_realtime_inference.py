"""
Real-time PoseRAC Inference qua Camera
Nhận diện và đếm số lần lặp lại động tác từ camera real-time
"""
import pandas as pd
import numpy as np
import cv2
from mediapipe.python.solutions import drawing_utils as mp_drawing
from mediapipe.python.solutions import pose as mp_pose
import torch
import argparse
from model import PoseRAC, Action_trigger


def normalize_landmarks(landmarks):
    """Chuẩn hóa pose landmarks"""
    landmarks = np.array(landmarks).reshape(1, 33, 3)
    x_max = np.expand_dims(np.max(landmarks[:, :, 0], axis=1), 1)
    x_min = np.expand_dims(np.min(landmarks[:, :, 0], axis=1), 1)
    
    y_max = np.expand_dims(np.max(landmarks[:, :, 1], axis=1), 1)
    y_min = np.expand_dims(np.min(landmarks[:, :, 1], axis=1), 1)
    
    z_max = np.expand_dims(np.max(landmarks[:, :, 2], axis=1), 1)
    z_min = np.expand_dims(np.min(landmarks[:, :, 2], axis=1), 1)
    
    landmarks[:, :, 0] = (landmarks[:, :, 0] - x_min) / (x_max - x_min + 1e-9)
    landmarks[:, :, 1] = (landmarks[:, :, 1] - y_min) / (y_max - y_min + 1e-9)
    landmarks[:, :, 2] = (landmarks[:, :, 2] - z_min) / (z_max - z_min + 1e-9)
    
    landmarks = landmarks.reshape(1, -1)
    return landmarks


class RealtimeActionCounter:
    """Class để đếm số lần lặp lại động tác real-time"""
    def __init__(self, action_name, enter_threshold=0.78, exit_threshold=0.4, momentum=0.4):
        self.action_name = action_name
        self.enter_threshold = enter_threshold
        self.exit_threshold = exit_threshold
        self.momentum = momentum
        
        # Initialize action triggers
        self.repetition_salient_1 = Action_trigger(
            action_name=action_name,
            enter_threshold=enter_threshold,
            exit_threshold=exit_threshold
        )
        self.repetition_salient_2 = Action_trigger(
            action_name=action_name,
            enter_threshold=enter_threshold,
            exit_threshold=exit_threshold
        )
        
        # State variables
        self.classify_prob = 0.5
        self.pose_count = 0
        self.curr_pose = 'holder'
        self.init_pose = 'pose_holder'
        self.confidence_history = []
        self.max_history = 30  # Giữ lịch sử 30 frame gần nhất
        
    def update(self, action_score):
        """Cập nhật state và đếm số lần lặp lại"""
        # Smooth prediction với momentum
        self.classify_prob = action_score * (1.0 - self.momentum) + self.momentum * self.classify_prob
        
        # Lưu vào history
        self.confidence_history.append(self.classify_prob)
        if len(self.confidence_history) > self.max_history:
            self.confidence_history.pop(0)
        
        # Check triggers cho 2 salient poses
        salient1_triggered = self.repetition_salient_1(self.classify_prob)
        reverse_classify_prob = 1 - self.classify_prob
        salient2_triggered = self.repetition_salient_2(reverse_classify_prob)
        
        # Xác định initial pose
        if self.init_pose == 'pose_holder':
            if salient1_triggered:
                self.init_pose = 'salient1'
            elif salient2_triggered:
                self.init_pose = 'salient2'
        
        # Đếm transitions giữa 2 poses
        if self.init_pose == 'salient1':
            if self.curr_pose == 'salient1' and salient2_triggered:
                self.pose_count += 1
        else:
            if self.curr_pose == 'salient2' and salient1_triggered:
                self.pose_count += 1
        
        # Update current pose
        if salient1_triggered:
            self.curr_pose = 'salient1'
        elif salient2_triggered:
            self.curr_pose = 'salient2'
        
        return self.pose_count, self.classify_prob
    
    def reset(self):
        """Reset counter về trạng thái ban đầu"""
        self.pose_count = 0
        self.curr_pose = 'holder'
        self.init_pose = 'pose_holder'
        self.classify_prob = 0.5
        self.confidence_history = []
        # Reset triggers
        self.repetition_salient_1 = Action_trigger(
            action_name=self.action_name,
            enter_threshold=self.enter_threshold,
            exit_threshold=self.exit_threshold
        )
        self.repetition_salient_2 = Action_trigger(
            action_name=self.action_name,
            enter_threshold=self.enter_threshold,
            exit_threshold=self.exit_threshold
        )


def find_best_action(all_scores, index2action, window_size=30):
    """
    Tìm action tốt nhất dựa trên confidence scores trong window gần nhất
    """
    if len(all_scores) < window_size:
        window_size = len(all_scores)
    
    recent_scores = all_scores[-window_size:]
    avg_scores = {}
    
    for action_index in index2action:
        scores = [score[action_index] for score in recent_scores]
        avg_scores[action_index] = np.mean(scores)
    
    best_index = max(avg_scores, key=avg_scores.get)
    return index2action[best_index], avg_scores[best_index]


def draw_info(frame, action_name, count, confidence, pose_detected, 
              best_action=None, best_conf=None, show_all_actions=False, all_scores=None, index2action=None):
    """Vẽ thông tin lên frame"""
    height, width = frame.shape[:2]
    
    # Background cho text
    overlay = frame.copy()
    
    # Hiển thị action và count chính
    if pose_detected:
        # Action name
        action_text = f"Action: {action_name}"
        cv2.putText(frame, action_text, (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Count
        count_text = f"Count: {count}"
        cv2.putText(frame, count_text, (10, 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
        
        # Confidence
        conf_text = f"Confidence: {confidence:.2f}"
        color = (0, 255, 0) if confidence > 0.5 else (0, 165, 255)
        cv2.putText(frame, conf_text, (10, 110), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Best action (nếu có)
        if best_action and best_action != action_name:
            best_text = f"Best: {best_action} ({best_conf:.2f})"
            cv2.putText(frame, best_text, (10, 150), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
        
        # Hiển thị tất cả actions (nếu được yêu cầu)
        if show_all_actions and all_scores and index2action:
            y_offset = 180
            for idx, action in index2action.items():
                if len(all_scores) > 0:
                    score = all_scores[-1][idx]
                    action_line = f"{action}: {score:.2f}"
                    cv2.putText(frame, action_line, (10, y_offset), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
                    y_offset += 20
    else:
        cv2.putText(frame, "No pose detected", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    
    # Hướng dẫn
    help_text = "Press 'q' to quit | 'r' to reset | 'a' to toggle all actions"
    cv2.putText(frame, help_text, (10, height - 20), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    return frame


def main():
    parser = argparse.ArgumentParser(description='Real-time PoseRAC inference qua camera')
    parser.add_argument('--camera', type=int, default=0,
                        help='Camera index (default: 0)')
    parser.add_argument('--model', type=str, default='best_weights_PoseRAC.pth',
                        help='Đường dẫn đến model weights (default: best_weights_PoseRAC.pth)')
    parser.add_argument('--csv', type=str, default='all_action.csv',
                        help='Đường dẫn đến CSV file chứa action labels (default: all_action.csv)')
    parser.add_argument('--action', type=str, default=None,
                        help='Action cụ thể để theo dõi (nếu không chỉ định sẽ tự động detect)')
    parser.add_argument('--enter_threshold', type=float, default=0.78,
                        help='Enter threshold (default: 0.78)')
    parser.add_argument('--exit_threshold', type=float, default=0.4,
                        help='Exit threshold (default: 0.4)')
    parser.add_argument('--momentum', type=float, default=0.4,
                        help='Momentum cho smoothing (default: 0.4)')
    parser.add_argument('--auto_detect', action='store_true',
                        help='Tự động detect action tốt nhất (default: False)')
    parser.add_argument('--detect_window', type=int, default=30,
                        help='Số frame để tính toán action tốt nhất (default: 30)')
    
    args = parser.parse_args()
    
    print("="*60)
    print("POSERAC - REAL-TIME CAMERA INFERENCE")
    print("="*60)
    
    # Load action labels
    print(f"Đang load action labels từ: {args.csv}")
    label_pd = pd.read_csv(args.csv)
    index2action = {}
    for _, row in label_pd.iterrows():
        index2action[row['label']] = row['action']
    num_classes = len(index2action)
    
    print(f"Các loại động tác có thể nhận diện: {list(index2action.values())}")
    
    # Load model
    print(f"\nĐang load model từ: {args.model}")
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Sử dụng device: {device}")
    
    model = PoseRAC(None, None, None, None, dim=99, heads=9,
                    enc_layer=6, learning_rate=0.001,
                    seed=42, num_classes=num_classes, alpha=0.01)
    
    model.load_state_dict(torch.load(args.model, map_location=device))
    model.eval()
    model.to(device)
    
    # Initialize pose tracker
    pose_tracker = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Initialize camera
    print(f"\nĐang mở camera {args.camera}...")
    cap = cv2.VideoCapture(args.camera)
    
    if not cap.isOpened():
        print(f"Lỗi: Không thể mở camera {args.camera}")
        return
    
    # Set camera properties để tăng tốc độ
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    print("Camera đã sẵn sàng!")
    print("\nHướng dẫn:")
    print("  - Nhấn 'q' để thoát")
    print("  - Nhấn 'r' để reset counter")
    print("  - Nhấn 'a' để hiển thị/ẩn tất cả actions")
    print("  - Nhấn 's' để chọn action cụ thể")
    print("\nBắt đầu nhận diện...\n")
    
    # Initialize counters cho tất cả actions
    action_counters = {}
    for action_index, action_name in index2action.items():
        action_counters[action_name] = RealtimeActionCounter(
            action_name=action_name,
            enter_threshold=args.enter_threshold,
            exit_threshold=args.exit_threshold,
            momentum=args.momentum
        )
    
    # State variables
    current_action = args.action
    all_scores = []  # Lưu tất cả scores để auto-detect
    show_all_actions = False
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Không thể đọc frame từ camera")
                break
            
            frame_count += 1
            
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process frame với MediaPipe
            result = pose_tracker.process(image=frame_rgb)
            pose_landmarks = result.pose_landmarks
            
            pose_detected = pose_landmarks is not None
            
            if pose_detected:
                # Extract landmarks
                landmarks = []
                for landmark in pose_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
                
                # Normalize landmarks
                normalized_landmarks = normalize_landmarks(landmarks)
                
                # Convert to tensor
                landmarks_tensor = torch.from_numpy(normalized_landmarks).float().to(device)
                
                # Run inference
                with torch.no_grad():
                    output = torch.sigmoid(model(landmarks_tensor))
                    output_numpy = output[0].cpu().numpy()
                
                # Lưu scores để auto-detect
                all_scores.append(output_numpy)
                if len(all_scores) > args.detect_window * 2:  # Giữ lịch sử đủ dài
                    all_scores.pop(0)
                
                # Auto-detect best action nếu được bật và chưa có action cụ thể
                best_action = None
                best_conf = None
                if args.auto_detect and not current_action and len(all_scores) >= args.detect_window:
                    best_action, best_conf = find_best_action(all_scores, index2action, args.detect_window)
                    if best_conf > 0.5:  # Chỉ chuyển sang action mới nếu confidence đủ cao
                        current_action = best_action
                        print(f"\nTự động chuyển sang action: {best_action} (confidence: {best_conf:.2f})")
                
                # Nếu có action cụ thể, sử dụng nó
                if current_action:
                    action_index = None
                    for idx, action in index2action.items():
                        if action == current_action:
                            action_index = idx
                            break
                    
                    if action_index is not None:
                        action_score = float(output_numpy[action_index])
                        count, confidence = action_counters[current_action].update(action_score)
                        
                        # Draw pose landmarks
                        mp_drawing.draw_landmarks(
                            frame_rgb,
                            pose_landmarks,
                            mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                        )
                        
                        # Draw info
                        frame_rgb = draw_info(
                            frame_rgb, current_action, count, confidence, True,
                            best_action, best_conf, show_all_actions, 
                            [output_numpy] if show_all_actions else None, 
                            index2action if show_all_actions else None
                        )
                else:
                    # Hiển thị tất cả actions nếu chưa chọn action cụ thể
                    action_scores = {}
                    for idx, action in index2action.items():
                        action_scores[action] = float(output_numpy[idx])
                    
                    # Draw pose landmarks
                    mp_drawing.draw_landmarks(
                        frame_rgb,
                        pose_landmarks,
                        mp_pose.POSE_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
                    )
                    
                    # Hiển thị top 3 actions
                    sorted_actions = sorted(action_scores.items(), key=lambda x: x[1], reverse=True)[:3]
                    y_offset = 30
                    for i, (action, score) in enumerate(sorted_actions):
                        text = f"{i+1}. {action}: {score:.2f}"
                        color = (0, 255, 0) if i == 0 else (255, 255, 255)
                        cv2.putText(frame_rgb, text, (10, y_offset), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                        y_offset += 30
                    
                    cv2.putText(frame_rgb, "Press 's' to select action", (10, y_offset + 10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)
            else:
                # Không detect được pose
                frame_rgb = draw_info(frame_rgb, "", 0, 0.0, False)
            
            # Convert RGB back to BGR để hiển thị
            frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
            
            # Hiển thị frame
            cv2.imshow('PoseRAC - Real-time Inference', frame_bgr)
            
            # Xử lý keyboard input
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("\nThoát chương trình...")
                break
            elif key == ord('r'):
                # Reset tất cả counters
                for counter in action_counters.values():
                    counter.reset()
                print("\nĐã reset tất cả counters")
            elif key == ord('a'):
                show_all_actions = not show_all_actions
                print(f"\n{'Hiển thị' if show_all_actions else 'Ẩn'} tất cả actions")
            elif key == ord('s'):
                # Chọn action
                print("\nCác actions có sẵn:")
                for idx, action in index2action.items():
                    print(f"  {idx}: {action}")
                try:
                    action_input = input("Nhập số index của action (hoặc Enter để auto-detect): ").strip()
                    if action_input:
                        action_idx = int(action_input)
                        if action_idx in index2action:
                            current_action = index2action[action_idx]
                            print(f"Đã chọn action: {current_action}")
                            # Reset counter cho action mới
                            action_counters[current_action].reset()
                        else:
                            print("Index không hợp lệ!")
                    else:
                        current_action = None
                        args.auto_detect = True
                        print("Đã bật auto-detect")
                except ValueError:
                    print("Input không hợp lệ!")
                except KeyboardInterrupt:
                    pass
    
    except KeyboardInterrupt:
        print("\n\nThoát chương trình...")
    
    finally:
        # Cleanup
        cap.release()
        pose_tracker.close()
        cv2.destroyAllWindows()
        print("Đã giải phóng tài nguyên")


if __name__ == "__main__":
    main()

