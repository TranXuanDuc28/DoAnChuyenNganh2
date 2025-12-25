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


from pose_assessment import FormEvaluator

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
        
        # Text rendering with cache - LARGER & BOLDER
        # Số lần
        frame = text_renderer.render(frame, f"Số lần: {pose_count}", 
                                     (width - 350, 60), font_size=55, color=(0, 0, 255))
        
        # Bài tập & Độ tin cậy
        frame = text_renderer.render(frame, f"Bài tập: {best_action_name}", 
                                     (30, height - 200), font_size=45, color=(255, 0, 0))
        
        frame = text_renderer.render(frame, f"Độ tin cậy: {classify_prob:.2f}", 
                                     (30, height - 140), font_size=35, color=(0, 255, 0))
        
        # Điểm số
        score_color = (0, 255, 0) if current_form_score >= 85 else \
                     (0, 255, 255) if current_form_score >= 70 else (0, 0, 255)
        
        frame = text_renderer.render(frame, f"Điểm: {current_form_score:.0f}/100", 
                                     (width - 350, 140), font_size=50, color=score_color)
        
        # Feedback messages
        y_offset = height - 90
        for feedback_text in current_feedback[:3]:
            frame = text_renderer.render(frame, feedback_text, 
                                        (30, y_offset), font_size=32, color=(255, 255, 0))
            y_offset += 40
        
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