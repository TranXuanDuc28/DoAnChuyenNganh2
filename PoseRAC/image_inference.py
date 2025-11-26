"""
PoseRAC Inference từ ảnh
Nhận diện động tác từ một file ảnh
"""
import pandas as pd
import numpy as np
import cv2
from mediapipe.python.solutions import drawing_utils as mp_drawing
from mediapipe.python.solutions import pose as mp_pose
import torch
import argparse
import os
from model import PoseRAC


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


def draw_results(image, action_scores, pose_landmarks=None):
    """Vẽ kết quả lên ảnh"""
    height, width = image.shape[:2]
    
    # Vẽ skeleton nếu có
    if pose_landmarks is not None:
        mp_drawing.draw_landmarks(
            image,
            pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2)
        )
    
    # Sắp xếp actions theo confidence
    sorted_actions = sorted(action_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Vẽ background cho text
    overlay = image.copy()
    cv2.rectangle(overlay, (10, 10), (400, 50 + len(sorted_actions) * 30), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, image, 0.4, 0, image)
    
    # Vẽ title
    cv2.putText(image, "PoseRAC Recognition Results", (15, 35), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    # Vẽ kết quả từng action
    y_offset = 65
    for i, (action_name, score) in enumerate(sorted_actions):
        # Màu sắc khác nhau cho top 3
        if i == 0:
            color = (0, 255, 0)  # Xanh lá - best
            prefix = ">>> "
        elif i == 1:
            color = (255, 255, 0)  # Vàng - second
            prefix = "   "
        elif i == 2:
            color = (255, 165, 0)  # Cam - third
            prefix = "   "
        else:
            color = (255, 255, 255)  # Trắng
            prefix = "   "
        
        text = f"{prefix}{action_name}: {score:.3f}"
        cv2.putText(image, text, (15, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        y_offset += 30
    
    return image


def inference_image(image_path, model_path='best_weights_PoseRAC.pth', 
                   csv_path='all_action.csv', output_path=None, show=True):
    """
    Nhận diện động tác từ một file ảnh
    
    Args:
        image_path: Đường dẫn đến file ảnh
        model_path: Đường dẫn đến model weights
        csv_path: Đường dẫn đến CSV file chứa action labels
        output_path: Đường dẫn để lưu ảnh kết quả (nếu None thì không lưu)
        show: Có hiển thị ảnh kết quả không
    
    Returns:
        dict: {
            'success': bool,
            'action_scores': dict mapping action name to confidence,
            'best_action': best action name,
            'best_score': best action confidence,
            'pose_detected': bool
        }
    """
    
    # Kiểm tra file ảnh có tồn tại không
    if not os.path.exists(image_path):
        return {
            'success': False,
            'error': f'File ảnh không tồn tại: {image_path}',
            'action_scores': {},
            'best_action': None,
            'best_score': 0.0,
            'pose_detected': False
        }
    
    print("="*60)
    print("POSERAC - IMAGE INFERENCE")
    print("="*60)
    
    # Load action labels
    print(f"Đang load action labels từ: {csv_path}")
    label_pd = pd.read_csv(csv_path)
    index2action = {}
    for _, row in label_pd.iterrows():
        index2action[row['label']] = row['action']
    num_classes = len(index2action)
    
    print(f"Các loại động tác có thể nhận diện: {list(index2action.values())}")
    
    # Load model
    print(f"\nĐang load model từ: {model_path}")
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Sử dụng device: {device}")
    
    model = PoseRAC(None, None, None, None, dim=99, heads=9,
                    enc_layer=6, learning_rate=0.001,
                    seed=42, num_classes=num_classes, alpha=0.01)
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model.to(device)
    
    # Load ảnh
    print(f"\nĐang load ảnh từ: {image_path}")
    image = cv2.imread(image_path)
    
    if image is None:
        return {
            'success': False,
            'error': f'Không thể đọc file ảnh: {image_path}',
            'action_scores': {},
            'best_action': None,
            'best_score': 0.0,
            'pose_detected': False
        }
    
    # Convert BGR to RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    # Initialize pose tracker
    pose_tracker = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Process ảnh với MediaPipe
    print("Đang extract pose landmarks...")
    result = pose_tracker.process(image=image_rgb)
    pose_landmarks = result.pose_landmarks
    
    pose_detected = pose_landmarks is not None
    
    if not pose_detected:
        print("⚠️  Không detect được pose trong ảnh!")
        pose_tracker.close()
        
        # Vẽ thông báo lên ảnh
        image_result = image.copy()
        cv2.putText(image_result, "No pose detected", (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
        
        if show:
            cv2.imshow('PoseRAC - No Pose Detected', image_result)
            print("\nNhấn phím bất kỳ để đóng cửa sổ...")
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        
        if output_path:
            cv2.imwrite(output_path, image_result)
            print(f"Đã lưu ảnh kết quả: {output_path}")
        
        return {
            'success': False,
            'error': 'No pose detected in image',
            'action_scores': {},
            'best_action': None,
            'best_score': 0.0,
            'pose_detected': False
        }
    
    # Extract landmarks
    print("Đang chuẩn hóa landmarks...")
    landmarks = []
    for landmark in pose_landmarks.landmark:
        landmarks.extend([landmark.x, landmark.y, landmark.z])
    
    # Normalize landmarks
    normalized_landmarks = normalize_landmarks(landmarks)
    
    # Convert to tensor
    landmarks_tensor = torch.from_numpy(normalized_landmarks).float().to(device)
    
    # Run inference
    print("Đang chạy inference...")
    with torch.no_grad():
        output = torch.sigmoid(model(landmarks_tensor))
        output_numpy = output[0].cpu().numpy()
    
    # Get action scores
    action_scores = {}
    for action_index, action_name in index2action.items():
        action_scores[action_name] = float(output_numpy[action_index])
    
    # Find best action
    best_action_index = np.argmax(output_numpy)
    best_action = index2action.get(best_action_index, 'unknown')
    best_score = float(output_numpy[best_action_index])
    
    # Vẽ kết quả lên ảnh
    print("\nĐang vẽ kết quả...")
    image_result = draw_results(image.copy(), action_scores, pose_landmarks)
    
    # Hiển thị kết quả
    print("\n" + "="*60)
    print("KẾT QUẢ NHẬN DIỆN")
    print("="*60)
    print(f"✅ Pose detected: Có")
    print(f"\nTop 3 actions:")
    sorted_actions = sorted(action_scores.items(), key=lambda x: x[1], reverse=True)[:3]
    for i, (action_name, score) in enumerate(sorted_actions, 1):
        marker = "🏆" if i == 1 else "  "
        print(f"{marker} {i}. {action_name}: {score:.3f}")
    print("="*60)
    
    # Hiển thị ảnh
    if show:
        cv2.imshow('PoseRAC - Image Inference Result', image_result)
        print("\nNhấn phím bất kỳ để đóng cửa sổ...")
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    # Lưu ảnh kết quả
    if output_path:
        cv2.imwrite(output_path, image_result)
        print(f"\n✅ Đã lưu ảnh kết quả: {output_path}")
    
    # Cleanup
    pose_tracker.close()
    
    return {
        'success': True,
        'action_scores': action_scores,
        'best_action': best_action,
        'best_score': best_score,
        'pose_detected': True
    }


def main():
    parser = argparse.ArgumentParser(description='PoseRAC inference từ ảnh')
    parser.add_argument('--image', type=str, required=True,
                        help='Đường dẫn đến file ảnh')
    parser.add_argument('--model', type=str, default='best_weights_PoseRAC.pth',
                        help='Đường dẫn đến model weights (default: best_weights_PoseRAC.pth)')
    parser.add_argument('--csv', type=str, default='all_action.csv',
                        help='Đường dẫn đến CSV file chứa action labels (default: all_action.csv)')
    parser.add_argument('--output', type=str, default=None,
                        help='Đường dẫn để lưu ảnh kết quả (nếu không chỉ định thì không lưu)')
    parser.add_argument('--no-show', action='store_true',
                        help='Không hiển thị ảnh kết quả (chỉ in kết quả ra console)')
    
    args = parser.parse_args()
    
    result = inference_image(
        image_path=args.image,
        model_path=args.model,
        csv_path=args.csv,
        output_path=args.output,
        show=not args.no_show
    )
    
    if not result['success']:
        print(f"\n❌ Lỗi: {result.get('error', 'Unknown error')}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())

