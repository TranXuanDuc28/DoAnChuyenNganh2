"""
Simple inference script for PoseRAC - OPTIMIZED VERSION
Tối ưu để tránh lag và đơ máy:
- Chạy trên GPU nếu có
- Giảm memory usage
- Process video theo batch nhỏ
- Không lưu tất cả frames vào RAM
"""
import pandas as pd
import numpy as np
import cv2
from mediapipe.python.solutions import pose as mp_pose
import torch
import argparse
from model import PoseRAC, Action_trigger
import gc


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


def extract_poses_from_video(video_path, skip_frames=1):
    """
    Extract pose landmarks từ video với optimization
    
    Args:
        video_path: Đường dẫn video
        skip_frames: Skip bao nhiêu frames (1 = process tất cả, 2 = skip 1 frame)
    
    Returns: numpy array of shape (num_frames, 99)
    """
    print(f"Đang extract poses từ video: {video_path}")
    print(f"Skip frames: {skip_frames} (process mỗi {skip_frames} frame để tăng tốc)")
    
    video_cap = cv2.VideoCapture(video_path)
    total_frames = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Tổng số frames trong video: {total_frames}")
    
    pose_tracker = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=0,  # 0 = lite, 1 = full, 2 = heavy (dùng 0 để nhanh hơn)
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    all_landmarks = []
    frame_count = 0
    processed_count = 0
    
    while True:
        success, frame = video_cap.read()
        if not success:
            break
        
        frame_count += 1
        
        # Skip frames để giảm tải
        if frame_count % skip_frames != 0:
            continue
        
        processed_count += 1
        if processed_count % 20 == 0:
            print(f"Processed {processed_count}/{total_frames//skip_frames} frames...", end='\r')
        
        # Resize frame để xử lý nhanh hơn
        height, width = frame.shape[:2]
        if width > 640:
            scale = 640 / width
            frame = cv2.resize(frame, (640, int(height * scale)))
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process frame
        result = pose_tracker.process(image=frame_rgb)
        
        if result.pose_landmarks:
            landmarks = []
            for landmark in result.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            all_landmarks.append(landmarks)
        else:
            # Nếu không detect được pose, dùng zeros
            all_landmarks.append([0.0] * 99)
    
    video_cap.release()
    pose_tracker.close()
    
    print(f"\nĐã extract {len(all_landmarks)} frames")
    
    # Convert to numpy array và normalize
    all_landmarks = np.array(all_landmarks, dtype=np.float32).reshape(-1, 33, 3)
    all_landmarks = normalize_landmarks(all_landmarks)
    
    return all_landmarks


def inference_video(video_path, model_path='best_weights_PoseRAC.pth', 
                   enter_threshold=0.78, exit_threshold=0.4, momentum=0.4,
                   skip_frames=1, use_gpu=True):
    """
    Inference một video - OPTIMIZED
    
    Args:
        video_path: Đường dẫn đến video input
        model_path: Đường dẫn đến model weights
        enter_threshold: Ngưỡng để vào salient pose
        exit_threshold: Ngưỡng để thoát salient pose
        momentum: Hệ số momentum để smooth predictions
        skip_frames: Skip frames để tăng tốc (1 = không skip)
        use_gpu: Dùng GPU nếu có
    
    Returns:
        dict: {
            'action_type': tên động tác,
            'repetition_count': số lần lặp lại,
            'action_index': index của action
        }
    """
    
    # Check GPU availability
    device = 'cpu'
    if use_gpu and torch.cuda.is_available():
        device = 'cuda'
        print(f"✅ Sử dụng GPU: {torch.cuda.get_device_name(0)}")
    else:
        print(f"⚠️  Sử dụng CPU (GPU không khả dụng hoặc bị tắt)")
    
    # Load action labels
    label_pd = pd.read_csv('all_action.csv')
    index2action = {}
    for _, row in label_pd.iterrows():
        index2action[row['label']] = row['action']
    num_classes = len(index2action)
    
    print(f"Các loại động tác có thể nhận diện: {list(index2action.values())}")
    
    # Extract poses from video
    poses = extract_poses_from_video(video_path, skip_frames=skip_frames)
    
    # Load model
    print(f"\nĐang load model từ: {model_path}")
    model = PoseRAC(None, None, None, None, dim=99, heads=9,
                    enc_layer=6, learning_rate=0.001,
                    seed=42, num_classes=num_classes, alpha=0.01)
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model.to(device)
    
    # Inference
    print("Đang inference...")
    poses_tensor = torch.from_numpy(poses).float().to(device)
    
    with torch.no_grad():
        # Process theo batch để tránh OOM
        batch_size = 64
        all_output = []
        
        for i in range(0, len(poses_tensor), batch_size):
            batch = poses_tensor[i:i+batch_size]
            output = torch.sigmoid(model(batch))
            all_output.append(output.cpu())  # Move về CPU ngay để giải phóng GPU memory
            
            if i % (batch_size * 5) == 0:
                print(f"Processing batch {i}/{len(poses_tensor)}...", end='\r')
        
        all_output = torch.cat(all_output, dim=0)
    
    # Clear GPU memory
    if device == 'cuda':
        torch.cuda.empty_cache()
    del poses_tensor
    gc.collect()
    
    # Thử với từng action class để tìm action phù hợp nhất
    best_action_index = -1
    best_action_name = None
    best_count = 0
    
    print("\n\nĐang phân tích từng loại động tác...")
    
    for action_index in index2action:
        action_name = index2action[action_index]
        
        # Initialize action triggers cho 2 salient poses
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
        
        # Process từng frame
        for output in all_output:
            output_numpy = output[action_index].numpy()
            
            # Smooth prediction với momentum
            classify_prob = output_numpy * (1.0 - momentum) + momentum * classify_prob
            
            # Check triggers cho 2 salient poses
            salient1_triggered = repetition_salient_1(classify_prob)
            reverse_classify_prob = 1 - classify_prob
            salient2_triggered = repetition_salient_2(reverse_classify_prob)
            
            # Xác định initial pose
            if init_pose == 'pose_holder':
                if salient1_triggered:
                    init_pose = 'salient1'
                elif salient2_triggered:
                    init_pose = 'salient2'
            
            # Đếm transitions giữa 2 poses
            if init_pose == 'salient1':
                if curr_pose == 'salient1' and salient2_triggered:
                    pose_count += 1
            else:
                if curr_pose == 'salient2' and salient1_triggered:
                    pose_count += 1
            
            # Update current pose
            if salient1_triggered:
                curr_pose = 'salient1'
            elif salient2_triggered:
                curr_pose = 'salient2'
        
        print(f"  {action_name}: {pose_count} lần lặp lại")
        
        # Chọn action có số lần lặp lại cao nhất
        if pose_count > best_count:
            best_count = pose_count
            best_action_index = action_index
            best_action_name = action_name
    
    result = {
        'action_type': best_action_name,
        'repetition_count': best_count,
        'action_index': best_action_index
    }
    
    return result


def main():
    parser = argparse.ArgumentParser(description='Simple inference cho PoseRAC - OPTIMIZED')
    parser.add_argument('--video', type=str, required=True,
                        help='Đường dẫn đến video input')
    parser.add_argument('--model', type=str, default='best_weights_PoseRAC.pth',
                        help='Đường dẫn đến model weights (default: best_weights_PoseRAC.pth)')
    parser.add_argument('--enter_threshold', type=float, default=0.78,
                        help='Enter threshold (default: 0.78)')
    parser.add_argument('--exit_threshold', type=float, default=0.4,
                        help='Exit threshold (default: 0.4)')
    parser.add_argument('--momentum', type=float, default=0.4,
                        help='Momentum cho smoothing (default: 0.4)')
    parser.add_argument('--skip_frames', type=int, default=2,
                        help='Skip frames để tăng tốc (1=không skip, 2=skip 1 frame, 3=skip 2 frames...)')
    parser.add_argument('--cpu', action='store_true',
                        help='Bắt buộc dùng CPU thay vì GPU')
    
    args = parser.parse_args()
    
    print("="*60)
    print("POSERAC - SIMPLE INFERENCE (OPTIMIZED)")
    print("="*60)
    
    result = inference_video(
        video_path=args.video,
        model_path=args.model,
        enter_threshold=args.enter_threshold,
        exit_threshold=args.exit_threshold,
        momentum=args.momentum,
        skip_frames=args.skip_frames,
        use_gpu=not args.cpu
    )
    
    print("\n" + "="*60)
    print("KẾT QUẢ INFERENCE")
    print("="*60)
    print(f"Loại động tác: {result['action_type']}")
    print(f"Số lần lặp lại: {result['repetition_count']}")
    print("="*60)


if __name__ == "__main__":
    main()
