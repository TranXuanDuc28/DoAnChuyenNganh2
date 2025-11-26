"""
PoseRAC Inference with Video Visualization - OPTIMIZED
Tạo video output như demo với skeleton, graph, counter
Tối ưu để không bị lag/đơ máy
"""
import pandas as pd
import numpy as np
import cv2
from mediapipe.python.solutions import drawing_utils as mp_drawing
from mediapipe.python.solutions import pose as mp_pose
import torch
import argparse
from model import PoseRAC, Action_trigger
from matplotlib import pyplot as plt
from PIL import Image, ImageDraw, ImageFont
import io
import gc
import os


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


def create_graph_overlay(history, width, height, max_width=0.35, max_height=0.25):
    """Tạo graph overlay cho video - tối ưu hóa"""
    if len(history) < 2:
        return None
    
    fig, ax = plt.subplots(figsize=(4, 2), dpi=80)
    
    y = [h if h is not None else 0 for h in history[-100:]]  # Chỉ lấy 100 frames gần nhất
    ax.plot(y, linewidth=2, color='#2196F3')
    
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    ax.set_xlabel('Frame', fontsize=8)
    ax.set_ylabel('Confidence', fontsize=8)
    ax.set_ylim([0, 1])
    ax.tick_params(labelsize=7)
    
    # Convert to image
    buf = io.BytesIO()
    plt.tight_layout()
    fig.savefig(buf, format='png', dpi=80, bbox_inches='tight')
    plt.close(fig)
    
    buf.seek(0)
    img = Image.open(buf)
    
    # Resize to fit video
    target_width = int(width * max_width)
    target_height = int(height * max_height)
    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    return np.array(img)


def add_visualization_to_frame(frame, pose_landmarks, count, action_name, 
                               confidence, history, frame_idx):
    """Thêm visualization vào frame - tối ưu"""
    output_frame = frame.copy()
    height, width = frame.shape[:2]
    
    # 1. Draw skeleton
    if pose_landmarks is not None:
        mp_drawing.draw_landmarks(
            image=output_frame,
            landmark_list=pose_landmarks,
            connections=mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(
                color=(0, 255, 0), thickness=2, circle_radius=2),
            connection_drawing_spec=mp_drawing.DrawingSpec(
                color=(255, 255, 255), thickness=2)
        )
    
    # 2. Add graph overlay (mỗi 5 frames để tăng tốc)
    if frame_idx % 5 == 0 and len(history) > 1:
        graph_img = create_graph_overlay(history, width, height)
        if graph_img is not None:
            # Overlay graph lên góc trái trên
            x_offset = int(width * 0.02)
            y_offset = int(height * 0.02)
            h, w = graph_img.shape[:2]
            
            # Blend graph với frame
            roi = output_frame[y_offset:y_offset+h, x_offset:x_offset+w]
            if roi.shape[:2] == graph_img.shape[:2]:
                # Convert RGBA to RGB if needed
                if graph_img.shape[2] == 4:
                    graph_img = cv2.cvtColor(graph_img, cv2.COLOR_RGBA2RGB)
                output_frame[y_offset:y_offset+h, x_offset:x_offset+w] = cv2.addWeighted(
                    roi, 0.3, graph_img, 0.7, 0)
    
    # 3. Add text overlays
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.0
    thickness = 2
    
    # Counter (góc phải trên)
    counter_text = f"Count: {count}"
    text_size = cv2.getTextSize(counter_text, font, font_scale, thickness)[0]
    counter_pos = (width - text_size[0] - 20, 50)
    cv2.putText(output_frame, counter_text, counter_pos, font, 
                font_scale, (0, 0, 255), thickness, cv2.LINE_AA)
    
    # Action name (góc trái dưới)
    action_text = f"Action: {action_name}"
    action_pos = (20, height - 80)
    cv2.putText(output_frame, action_text, action_pos, font, 
                font_scale, (255, 0, 0), thickness, cv2.LINE_AA)
    
    # Confidence (góc trái dưới)
    conf_text = f"Confidence: {confidence:.2f}"
    conf_pos = (20, height - 30)
    cv2.putText(output_frame, conf_text, conf_pos, font, 
                0.7, (0, 255, 0), 2, cv2.LINE_AA)
    
    return output_frame


def inference_with_video_output(video_path, output_path=None, 
                                model_path='best_weights_PoseRAC.pth',
                                enter_threshold=0.78, exit_threshold=0.4, 
                                momentum=0.4, skip_frames=1, use_gpu=True):
    """
    Inference video và tạo output video có visualization - OPTIMIZED
    """
    
    # Setup device
    device = 'cpu'
    if use_gpu and torch.cuda.is_available():
        device = 'cuda'
        print(f"✅ Sử dụng GPU: {torch.cuda.get_device_name(0)}")
    else:
        print(f"⚠️  Sử dụng CPU")
    
    # Auto-generate output path
    if output_path is None:
        base_name = os.path.splitext(video_path)[0]
        output_path = f"{base_name}_output.mp4"
    
    # Load action labels
    label_pd = pd.read_csv('all_action.csv')
    index2action = {}
    for _, row in label_pd.iterrows():
        index2action[row['label']] = row['action']
    num_classes = len(index2action)
    
    print(f"Các loại động tác: {list(index2action.values())}")
    
    # Load model
    print(f"Đang load model từ: {model_path}")
    model = PoseRAC(None, None, None, None, dim=99, heads=9,
                    enc_layer=6, learning_rate=0.001,
                    seed=42, num_classes=num_classes, alpha=0.01)
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model.to(device)
    
    # PASS 1: Extract poses from ALL frames
    print(f"\n📹 PASS 1: Extracting poses from video...")
    video_cap = cv2.VideoCapture(video_path)
    
    fps = int(video_cap.get(cv2.CAP_PROP_FPS))
    width = int(video_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video: {width}x{height} @ {fps}fps, {total_frames} frames")
    print(f"Skip frames: {skip_frames}")
    
    pose_tracker = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=0,  # Lite model
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    all_landmarks = []
    all_frames_for_video = []  # Lưu TẤT CẢ frames để render video
    all_pose_results = []  # Lưu pose results tương ứng với all_landmarks (chỉ processed frames)
    frame_count = 0
    processed_count = 0
    
    while True:
        success, frame = video_cap.read()
        if not success:
            break
        
        frame_count += 1
        all_frames_for_video.append(frame)  # Lưu mọi frame để render
        
        # Skip frames để giảm tải processing
        if frame_count % skip_frames != 0:
            continue
        
        processed_count += 1
        if processed_count % 30 == 0:
            print(f"  Processed {processed_count} frames...", end='\r')
        
        # Resize for faster processing
        if width > 640:
            scale = 640 / width
            resized_frame = cv2.resize(frame, (640, int(height * scale)))
        else:
            resized_frame = frame
        
        frame_rgb = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
        result = pose_tracker.process(image=frame_rgb)
        
        all_pose_results.append(result.pose_landmarks)
        
        if result.pose_landmarks:
            landmarks = []
            for landmark in result.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            all_landmarks.append(landmarks)
        else:
            all_landmarks.append([0.0] * 99)
    
    video_cap.release()
    pose_tracker.close()
    
    print(f"\n  ✅ Extracted {len(all_landmarks)} frames")
    
    # PASS 2: Model inference
    print(f"\n🧠 PASS 2: Running model inference...")
    poses = np.array(all_landmarks, dtype=np.float32).reshape(-1, 33, 3)
    poses = normalize_landmarks(poses)
    poses_tensor = torch.from_numpy(poses).float().to(device)
    
    with torch.no_grad():
        batch_size = 128
        all_output = []
        
        for i in range(0, len(poses_tensor), batch_size):
            batch = poses_tensor[i:i+batch_size]
            output = torch.sigmoid(model(batch))
            all_output.append(output.cpu())
            
            if i % (batch_size * 2) == 0:
                print(f"  Processing {i}/{len(poses_tensor)}...", end='\r')
        
        all_output = torch.cat(all_output, dim=0)
    
    print(f"\n  ✅ Inference complete")
    
    # Clear GPU memory
    if device == 'cuda':
        torch.cuda.empty_cache()
    del poses_tensor
    gc.collect()
    
    # PASS 3: Find best action
    print(f"\n🔍 PASS 3: Analyzing actions...")
    best_action_index = -1
    best_action_name = None
    best_count = -1
    best_avg_conf = -1
    
    action_results = {}
    
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
        action_results[action_index] = {
            'name': action_name,
            'count': pose_count,
            'avg_conf': avg_conf
        }
        
        print(f"  {action_name}: {pose_count} reps (avg conf: {avg_conf:.3f})")
        
        # Chọn action tốt nhất dựa trên count, nếu bằng nhau thì dựa vào confidence
        if pose_count > best_count or (pose_count == best_count and avg_conf > best_avg_conf):
            best_count = pose_count
            best_action_index = action_index
            best_action_name = action_name
            best_avg_conf = avg_conf
    
    # Nếu không có action nào có count > 0, chọn action có avg confidence cao nhất
    if best_count == 0:
        for action_index, result in action_results.items():
            if result['avg_conf'] > best_avg_conf:
                best_count = result['count']
                best_action_index = action_index
                best_action_name = result['name']
                best_avg_conf = result['avg_conf']
    
    print(f"\n  ✅ Best action: {best_action_name} ({best_count} reps, avg conf: {best_avg_conf:.3f})")
    
    # PASS 4: Generate output video
    print(f"\n🎬 PASS 4: Generating output video...")
    print(f"Output path: {output_path}")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Re-initialize triggers for visualization
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
    
    processed_frame_idx = 0  # Index cho all_output và all_pose_results
    
    # Render ALL frames
    for frame_idx in range(len(all_frames_for_video)):
        frame = all_frames_for_video[frame_idx]
        
        # Chỉ update predictions cho processed frames
        if (frame_idx + 1) % skip_frames == 0 and processed_frame_idx < len(all_output):
            output = all_output[processed_frame_idx]
            output_numpy = output[best_action_index].numpy()
            classify_prob = output_numpy * (1.0 - momentum) + momentum * classify_prob
            
            # Update history
            history.append(classify_prob)
            
            # Count repetitions
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
            
            # Get pose for this processed frame
            pose_landmarks = all_pose_results[processed_frame_idx]
            processed_frame_idx += 1
        else:
            # Frame bị skip - dùng giá trị từ frame trước
            pose_landmarks = None
        
        # Add visualization
        vis_frame = add_visualization_to_frame(
            frame=frame,
            pose_landmarks=pose_landmarks,
            count=pose_count,
            action_name=best_action_name,
            confidence=classify_prob,
            history=history,
            frame_idx=frame_idx
        )
        
        out_video.write(vis_frame)
        
        if frame_idx % 30 == 0:
            print(f"  Rendering {frame_idx}/{len(all_frames_for_video)} frames...", end='\r')
    
    out_video.release()
    
    print(f"\n  ✅ Video saved to: {output_path}")
    
    print(f"\n{'='*60}")
    print(f"KẾT QUẢ")
    print(f"{'='*60}")
    print(f"Động tác: {best_action_name}")
    print(f"Số lần lặp lại: {best_count}")
    print(f"Video output: {output_path}")
    print(f"{'='*60}")
    
    return {
        'action_type': best_action_name,
        'repetition_count': best_count,
        'output_video': output_path
    }


def main():
    parser = argparse.ArgumentParser(description='PoseRAC inference với video output - OPTIMIZED')
    parser.add_argument('--video', type=str, required=True,
                        help='Video input')
    parser.add_argument('--output', type=str, default=None,
                        help='Video output (auto nếu không chỉ định)')
    parser.add_argument('--model', type=str, default='best_weights_PoseRAC.pth',
                        help='Model weights path')
    parser.add_argument('--skip_frames', type=int, default=1,
                        help='Skip frames (1=không skip, 2=skip 1 frame...)')
    parser.add_argument('--cpu', action='store_true',
                        help='Bắt buộc dùng CPU')
    parser.add_argument('--enter_threshold', type=float, default=0.78)
    parser.add_argument('--exit_threshold', type=float, default=0.4)
    parser.add_argument('--momentum', type=float, default=0.4)
    
    args = parser.parse_args()
    
    print("="*60)
    print("POSERAC - INFERENCE WITH VIDEO VISUALIZATION (OPTIMIZED)")
    print("="*60)
    
    inference_with_video_output(
        video_path=args.video,
        output_path=args.output,
        model_path=args.model,
        enter_threshold=args.enter_threshold,
        exit_threshold=args.exit_threshold,
        momentum=args.momentum,
        skip_frames=args.skip_frames,
        use_gpu=not args.cpu
    )


if __name__ == "__main__":
    main()
