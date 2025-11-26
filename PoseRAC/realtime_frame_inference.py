"""
Realtime Frame Inference cho PoseRAC
Nhận frame đơn lẻ (base64 image) và trả về kết quả pose evaluation
"""
import sys
import json
import base64
import numpy as np
import cv2
from mediapipe.python.solutions import pose as mp_pose
import torch
from model import PoseRAC, Action_trigger
import pandas as pd
from io import BytesIO
from PIL import Image


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


def decode_base64_image(image_base64):
    """Decode base64 image thành numpy array"""
    # Remove data URL prefix if present
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    
    # Decode base64
    try:
        image_data = base64.b64decode(image_base64)
    except Exception as e:
        raise ValueError(f"Failed to decode base64: {str(e)}")
    
    # Convert to PIL Image
    try:
        image = Image.open(BytesIO(image_data))
    except Exception as e:
        raise ValueError(f"Failed to open image: {str(e)}")
    
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array
    frame = np.array(image)
    
    # Convert BGR to RGB if needed (PIL uses RGB, but OpenCV uses BGR)
    # Actually, MediaPipe expects RGB, so we're good
    
    return frame


def process_frame(image_base64, model, pose_tracker, index2action, device, 
                 expected_action=None, enter_threshold=0.78, exit_threshold=0.4):
    """
    Xử lý một frame và trả về kết quả
    
    Args:
        image_base64: Base64 encoded image
        model: Loaded PoseRAC model
        pose_tracker: MediaPipe pose tracker
        index2action: Dictionary mapping action index to name
        device: torch device
        expected_action: Expected action name (optional, để filter kết quả)
        enter_threshold: Threshold for action detection
        exit_threshold: Threshold for action exit
    
    Returns:
        dict với các keys:
        - success: bool
        - landmarks: list of landmarks (33 points, each with x, y, z)
        - action_scores: dict mapping action name to confidence score
        - best_action: best action name
        - best_score: best action confidence
        - phase: current phase ('salient1', 'salient2', or None)
        - error: error message if failed
    """
    try:
        # Decode image
        frame = decode_base64_image(image_base64)
        # Frame from PIL is already RGB, no need to convert
        frame_rgb = frame
        
        # Extract pose landmarks
        result = pose_tracker.process(image=frame_rgb)
        
        if not result.pose_landmarks:
            return {
                'success': False,
                'error': 'No pose detected',
                'landmarks': None,
                'action_scores': {},
                'best_action': None,
                'best_score': 0.0,
                'phase': None
            }
        
        # Extract landmarks
        landmarks = []
        for landmark in result.pose_landmarks.landmark:
            landmarks.extend([landmark.x, landmark.y, landmark.z])
        
        # Normalize landmarks
        normalized_landmarks = normalize_landmarks(landmarks)
        
        # Convert to tensor
        landmarks_tensor = torch.from_numpy(normalized_landmarks).float().to(device)
        
        # Run inference
        with torch.no_grad():
            output = torch.sigmoid(model(landmarks_tensor))
            output_numpy = output[0].cpu().numpy()
        
        # Get action scores
        action_scores = {}
        for action_index, action_name in index2action.items():
            action_scores[action_name] = float(output_numpy[action_index])
        
        # Find best action
        if expected_action and expected_action in action_scores:
            # If expected action is provided, use it
            best_action = expected_action
            best_score = action_scores[expected_action]
        else:
            # Otherwise, find best action
            best_action_index = np.argmax(output_numpy)
            best_action = index2action.get(best_action_index, 'unknown')
            best_score = float(output_numpy[best_action_index])
        
        # Determine phase based on best action score
        phase = None
        if best_action and best_action != 'unknown':
            if best_score >= enter_threshold:
                phase = 'salient1'
            elif best_score <= exit_threshold:
                phase = 'salient2'
        
        return {
            'success': True,
            'landmarks': landmarks,  # List of 99 values (33 points * 3 coords)
            'action_scores': action_scores,
            'best_action': best_action,
            'best_score': best_score,
            'phase': phase,
            'error': None
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'landmarks': None,
            'action_scores': {},
            'best_action': None,
            'best_score': 0.0,
            'phase': None
        }


def main():
    """Main function để chạy từ command line"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python realtime_frame_inference.py <base64_image> [expected_action] [model_path] [csv_path]'
        }))
        sys.exit(1)
    
    # Đọc base64 từ file hoặc trực tiếp từ argv
    arg1 = sys.argv[1]

    # Nếu là file base64 → đọc file
    if arg1.endswith(".txt") or arg1.endswith(".b64") or arg1.endswith(".base64"):
        with open(arg1, "r", encoding="utf-8") as f:
            image_base64 = f.read()
    else:
        image_base64 = arg1
    expected_action = sys.argv[2] if len(sys.argv) > 2 else None
    model_path = sys.argv[3] if len(sys.argv) > 3 else 'best_weights_PoseRAC.pth'
    csv_path = sys.argv[4] if len(sys.argv) > 4 else 'all_action.csv'
    
    # Setup device
    device = 'cpu'
    if torch.cuda.is_available():
        device = 'cuda'
    
    # Load action labels
    label_pd = pd.read_csv(csv_path)
    index2action = {}
    for _, row in label_pd.iterrows():
        index2action[row['label']] = row['action']
    num_classes = len(index2action)
    
    # Load model
    model = PoseRAC(None, None, None, None, dim=99, heads=9,
                    enc_layer=6, learning_rate=0.001,
                    seed=42, num_classes=num_classes, alpha=0.01)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model.to(device)
    
    # Initialize pose tracker
    pose_tracker = mp_pose.Pose(
        static_image_mode=True,
        model_complexity=0,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )
    
    # Process frame
    result = process_frame(
        image_base64=image_base64,
        model=model,
        pose_tracker=pose_tracker,
        index2action=index2action,
        device=device,
        expected_action=expected_action
    )
    
    # Cleanup
    pose_tracker.close()
    
    # Output JSON result
    print(json.dumps(result, indent=2))
    
    sys.exit(0 if result['success'] else 1)


if __name__ == '__main__':
    main()

