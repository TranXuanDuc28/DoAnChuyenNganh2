"""
Simple inference script for PoseRAC with VIDEO OUTPUT
Input: Video path
Output: 
  - Số lần lặp lại động tác và loại động tác
  - Video có visualization (skeleton + count + graph)
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


def plot_classification_history(history, action_name, output_width, output_height, 
                                plot_figsize=(9, 4), plot_max_width=0.4, plot_max_height=0.4):
    """Tạo plot cho classification history"""
    fig = plt.figure(figsize=plot_figsize)
    
    y = [h if h is not None else 0 for h in history]
    plt.plot(y, linewidth=3, color='blue')
    
    plt.grid(axis='y', alpha=0.75)
    plt.xlabel('Frame')
    plt.ylabel('Confidence')
    plt.title(f'Classification history for `{action_name}`')
    plt.ylim(0, 1)
    
    # Convert plot to image
    buf = io.BytesIO()
    dpi = min(
        output_width * plot_max_width / float(plot_figsize[0]),
        output_height * plot_max_height / float(plot_figsize[1]))
    fig.savefig(buf, dpi=dpi)
    buf.seek(0)
    img = Image.open(buf)
    plt.close()
    
    return img


def add_visualization_to_frame(frame, pose_landmarks, confidence, repetition_count, 
                               action_name, confidence_history, frame_idx):
    """Thêm visualization vào frame"""
    output_frame = frame.copy()
    height, width = output_frame.shape[:2]
    
    # Vẽ pose skeleton
    if pose_landmarks is not None:
        mp_drawing.draw_landmarks(
            image=output_frame,
            landmark_list=pose_landmarks,
            connections=mp_pose.POSE_CONNECTIONS)
    
    # Convert sang PIL Image để vẽ text và graph đẹp hơn
    output_img = Image.fromarray(output_frame)
    
    # Vẽ graph
    if len(confidence_history) > 1:
        plot_img = plot_classification_history(
            confidence_history, action_name, width, height)
        plot_img.thumbnail((int(width * 0.4), int(height * 0.4)), Image.LANCZOS)
        output_img.paste(plot_img, (int(width * 0.05), int(height * 0.05)))
    
    # Vẽ counter
    draw = ImageDraw.Draw(output_img)
    try:
        font_size = int(height * 0.1)
        font = ImageFont.truetype('Roboto-Regular.ttf', size=font_size)
    except:
        font = ImageFont.load_default()
    
    # Counter text
    counter_text = f"Count: {repetition_count}"
    counter_pos = (int(width * 0.75), int(height * 0.05))
    draw.text(counter_pos, counter_text, font=font, fill=(255, 0, 0))
    
    # Action text
    action_text = f"Action: {action_name}"
    action_pos = (int(width * 0.05), int(height * 0.85))
    draw.text(action_pos, action_text, font=font, fill=(0, 0, 255))
    
    # Confidence text
    conf_text = f"Conf: {confidence:.2f}"
    conf_pos = (int(width * 0.05), int(height * 0.92))
    draw.text(conf_pos, conf_text, font=font, fill=(0, 255, 0))
    
    return np.array(output_img)


def inference_video_with_visualization(video_path, output_path=None, 
                                       model_path='best_weights_PoseRAC.pth', 
                                       enter_threshold=0.78, exit_threshold=0.4, 
                                       momentum=0.4):
    """
    Inference video và tạo video output có visualization
    """
    
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
    
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    
    # Open video
    print(f"\nĐang xử lý video: {video_path}")
    video_cap = cv2.VideoCapture(video_path)
    
    # Get video properties
    fps = int(video_cap.get(cv2.CAP_PROP_FPS))
    width = int(video_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(video_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video info: {width}x{height} @ {fps}fps, {total_frames} frames")
    
    # Extract poses from video - PASS 1
    print("\nPASS 1: Extracting poses...")
    pose_tracker = mp_pose.Pose()
    all_landmarks = []
    all_frames = []
    all_pose_landmarks = []
    
    frame_idx = 0
    while True:
        success, frame = video_cap.read()
        if not success:
            break
        
        frame_idx += 1
        if frame_idx % 50 == 0:
            print(f"Extracted {frame_idx}/{total_frames} frames...", end='\r')
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        all_frames.append(frame_rgb)
        
        # Process frame
        result = pose_tracker.process(image=frame_rgb)
        all_pose_landmarks.append(result.pose_landmarks)
        
        if result.pose_landmarks:
            landmarks = []
            for landmark in result.pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            all_landmarks.append(landmarks)
        else:
            all_landmarks.append([0.0] * 99)
    
    video_cap.release()
    pose_tracker.close()
    
    print(f"\nĐã extract {len(all_landmarks)} frames")
    
    # Normalize poses
    all_landmarks = np.array(all_landmarks).reshape(-1, 33, 3)
    all_landmarks = normalize_landmarks(all_landmarks)
    
    # Inference - PASS 2
    print("\nPASS 2: Running inference...")
    poses_tensor = torch.from_numpy(all_landmarks).float()
    
    with torch.no_grad():
        all_output = torch.sigmoid(model(poses_tensor))
    
    # Tìm action tốt nhất
    print("\nPASS 3: Analyzing actions...")
    best_action_index = -1
    best_action_name = None
    best_count = 0
    
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
        
        for output in all_output:
            output_numpy = output[action_index].cpu().numpy()
            classify_prob = output_numpy * (1.0 - momentum) + momentum * classify_prob
            
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
        
        print(f"  {action_name}: {pose_count} lần")
        
        if pose_count > best_count:
            best_count = pose_count
            best_action_index = action_index
            best_action_name = action_name
    
    print(f"\nĐã xác định action: {best_action_name}")
    
    # Create output video - PASS 4
    if output_path is None:
        output_path = video_path.replace('.mp4', '_output.mp4')
    
    print(f"\nPASS 4: Creating output video: {output_path}")
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out_video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Re-run inference cho action được chọn để tạo video
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
    confidence_history = []
    
    for frame_idx, (frame, output, pose_landmarks) in enumerate(zip(all_frames, all_output, all_pose_landmarks)):
        if frame_idx % 50 == 0:
            print(f"Processing frame {frame_idx}/{len(all_frames)}...", end='\r')
        
        # Calculate confidence
        output_numpy = output[best_action_index].cpu().numpy()
        classify_prob = output_numpy * (1.0 - momentum) + momentum * classify_prob
        confidence_history.append(classify_prob)
        
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
        
        # Add visualization
        vis_frame = add_visualization_to_frame(
            frame, pose_landmarks, classify_prob, pose_count,
            best_action_name, confidence_history, frame_idx
        )
        
        # Convert RGB back to BGR for OpenCV
        vis_frame = cv2.cvtColor(vis_frame, cv2.COLOR_RGB2BGR)
        out_video.write(vis_frame)
    
    out_video.release()
    
    print(f"\n\n{'='*60}")
    print("HOÀN THÀNH!")
    print(f"{'='*60}")
    print(f"Video output: {output_path}")
    print(f"Action: {best_action_name}")
    print(f"Repetitions: {best_count}")
    print(f"{'='*60}")
    
    return {
        'action_type': best_action_name,
        'repetition_count': best_count,
        'output_video': output_path
    }


def main():
    parser = argparse.ArgumentParser(description='PoseRAC inference với video output visualization')
    parser.add_argument('--video', type=str, required=True,
                        help='Đường dẫn đến video input')
    parser.add_argument('--output', type=str, default=None,
                        help='Đường dẫn video output (mặc định: <input>_output.mp4)')
    parser.add_argument('--model', type=str, default='best_weights_PoseRAC.pth',
                        help='Đường dẫn đến model weights')
    parser.add_argument('--enter_threshold', type=float, default=0.78,
                        help='Enter threshold (default: 0.78)')
    parser.add_argument('--exit_threshold', type=float, default=0.4,
                        help='Exit threshold (default: 0.4)')
    parser.add_argument('--momentum', type=float, default=0.4,
                        help='Momentum (default: 0.4)')
    
    args = parser.parse_args()
    
    print("="*60)
    print("POSERAC - INFERENCE WITH VIDEO OUTPUT")
    print("="*60)
    
    result = inference_video_with_visualization(
        video_path=args.video,
        output_path=args.output,
        model_path=args.model,
        enter_threshold=args.enter_threshold,
        exit_threshold=args.exit_threshold,
        momentum=args.momentum
    )


if __name__ == "__main__":
    main()
