"""
WebSocket Server để nhận frame từ Expo Camera và trả về kết quả nhận diện pose
"""
import asyncio
import websockets
import json
import base64
import cv2
import numpy as np
import torch
import pandas as pd
from io import BytesIO
from PIL import Image
from mediapipe.python.solutions import drawing_utils as mp_drawing
from mediapipe.python.solutions import pose as mp_pose
from model import PoseRAC, Action_trigger  # Assume these are defined in model.py


class PoseDetectionServer:
    def __init__(self, model_path='best_weights_PoseRAC.pth', csv_path='all_action.csv'):
        print("Initializing Pose Detection Server...")
        
        # Load action labels
        print(f"Loading action labels from: {csv_path}")
        label_pd = pd.read_csv(csv_path)
        self.index2action = {}
        for _, row in label_pd.iterrows():
            self.index2action[row['label']] = row['action']
        self.num_classes = len(self.index2action)
        
        # Load model
        print(f"Loading model from: {model_path}")
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {self.device}")
        
        self.model = PoseRAC(None, None, None, None, dim=99, heads=9,
                            enc_layer=6, learning_rate=0.001,
                            seed=42, num_classes=self.num_classes, alpha=0.01)
        
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.eval()
        self.model.to(self.device)
        
        # Initialize MediaPipe Pose
        self.pose_tracker = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Session management
        self.active_sessions = {}
        
        print("Server initialized successfully!")
    
    def normalize_landmarks(self, landmarks):
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
    
    def decode_base64_image(self, base64_string):
        """Decode base64 string to OpenCV image"""
        try:
            # Remove data URL prefix if present
            if 'base64,' in base64_string:
                base64_string = base64_string.split('base64,')[1]
            
            # Decode base64
            img_data = base64.b64decode(base64_string)
            img = Image.open(BytesIO(img_data))
            
            # Convert to OpenCV format
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            return img_cv
        except Exception as e:
            print(f"Error decoding image: {e}")
            return None
    
    def process_frame(self, image, session_id, exercise_name, frame_id=None):
        """Xử lý một frame và trả về kết quả"""
        try:
            # Convert BGR to RGB for MediaPipe
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            h, w = image_rgb.shape[:2]
            
            # Process with MediaPipe
            result = self.pose_tracker.process(image=image_rgb)
            pose_landmarks = result.pose_landmarks
            
            if not pose_landmarks:
                return {
                    'success': False,
                    'message': 'No pose detected',
                    'keypoints': [],
                    'confidence': 0.0,
                    'action': None,
                    'rep_count': 0,
                    'frame_id': frame_id
                }
            
            # Extract landmarks
            landmarks = []
            keypoints = []
            for landmark in pose_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
                keypoints.append({
                    'x': landmark.x * w,
                    'y': landmark.y * h,
                    'confidence': landmark.visibility
                })
            
            # Normalize landmarks
            normalized_landmarks = self.normalize_landmarks(landmarks)
            
            # Convert to tensor
            landmarks_tensor = torch.from_numpy(normalized_landmarks).float().to(self.device)
            
            # Run inference
            with torch.no_grad():
                output = torch.sigmoid(self.model(landmarks_tensor))
                output_numpy = output[0].cpu().numpy()
            
            # Get action scores
            action_scores = {}
            for idx, action in self.index2action.items():
                action_scores[action] = float(output_numpy[idx])
            
            # Lấy session counter
            if session_id not in self.active_sessions:
                self.active_sessions[session_id] = {
                    'counter': RealtimeActionCounter(
                        action_name=exercise_name,
                        enter_threshold=0.78,
                        exit_threshold=0.4,
                        momentum=0.4
                    ),
                    'exercise': exercise_name
                }
            
            session = self.active_sessions[session_id]
            
            # Lấy action score cho exercise hiện tại
            action_index = None
            for idx, action in self.index2action.items():
                if action == exercise_name:
                    action_index = idx
                    break
            
            if action_index is not None:
                action_score = float(output_numpy[action_index])
                rep_count, confidence = session['counter'].update(action_score)
                is_correct = confidence > 0.5
            else:
                # Nếu không tìm thấy exercise, dùng action có confidence cao nhất
                best_action = max(action_scores, key=action_scores.get)
                confidence = action_scores[best_action]
                rep_count = 0
                is_correct = confidence > 0.5
            
            return {
                'success': True,
                'keypoints': keypoints,
                'confidence': float(confidence),
                'action': exercise_name,
                'action_scores': action_scores,
                'rep_count': rep_count,
                'isCorrect': is_correct,
                'message': 'Pose detected successfully',
                'frame_id': frame_id
            }
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error: {str(e)}',
                'keypoints': [],
                'confidence': 0.0,
                'action': None,
                'rep_count': 0,
                'frame_id': frame_id
            }
    
    async def handle_client(self, websocket, path):
        """Xử lý kết nối WebSocket từ client"""
        client_id = id(websocket)
        print(f"New client connected: {client_id}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    msg_type = data.get('type')
                    
                    if msg_type == 'start_session':
                        # Khởi tạo session mới
                        session_id = data.get('session_id', str(client_id))
                        exercise_name = data.get('exercise_name', 'squat')
                        
                        if session_id not in self.active_sessions:
                            self.active_sessions[session_id] = {
                                'counter': RealtimeActionCounter(
                                    action_name=exercise_name,
                                    enter_threshold=0.78,
                                    exit_threshold=0.4,
                                    momentum=0.4
                                ),
                                'exercise': exercise_name
                            }
                        
                        response = {
                            'type': 'session_started',
                            'session_id': session_id,
                            'exercise': exercise_name,
                            'success': True
                        }
                        await websocket.send(json.dumps(response))
                        print(f"Session started: {session_id} - Exercise: {exercise_name}")
                    
                    elif msg_type == 'evaluate_frame':
                        # Xử lý frame
                        session_id = data.get('session_id', str(client_id))
                        exercise_name = data.get('exercise_name', 'squat')
                        user_id = data.get('user_id', 'unknown')
                        image_base64 = data.get('image_base64')
                        frame_id = data.get('frame_id')  # Optional, echo back
                        
                        print(f"Processing frame for user {user_id}, session {session_id}, exercise {exercise_name}")
                        
                        if not image_base64:
                            await websocket.send(json.dumps({
                                'type': 'error',
                                'message': 'No image provided'
                            }))
                            continue
                        
                        # Decode image
                        image = self.decode_base64_image(image_base64)
                        if image is None:
                            await websocket.send(json.dumps({
                                'type': 'error',
                                'message': 'Failed to decode image'
                            }))
                            continue
                        
                        # Process frame
                        result = self.process_frame(image, session_id, exercise_name, frame_id)
                        result['type'] = 'frame_result'
                        result['session_id'] = session_id
                        
                        # Send result back to client
                        await websocket.send(json.dumps(result))
                    
                    elif msg_type == 'reset_session':
                        # Reset session counter
                        session_id = data.get('session_id', str(client_id))
                        if session_id in self.active_sessions:
                            self.active_sessions[session_id]['counter'].reset()
                            print(f"Session reset: {session_id}")
                        
                        await websocket.send(json.dumps({
                            'type': 'session_reset',
                            'session_id': session_id,
                            'success': True
                        }))
                    
                    elif msg_type == 'end_session':
                        # Kết thúc session
                        session_id = data.get('session_id', str(client_id))
                        if session_id in self.active_sessions:
                            del self.active_sessions[session_id]
                            print(f"Session ended: {session_id}")
                        
                        await websocket.send(json.dumps({
                            'type': 'session_ended',
                            'session_id': session_id,
                            'success': True
                        }))
                    
                    else:
                        await websocket.send(json.dumps({
                            'type': 'error',
                            'message': f'Unknown message type: {msg_type}'
                        }))
                
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': 'Invalid JSON'
                    }))
                except Exception as e:
                    print(f"Error handling message: {e}")
                    import traceback
                    traceback.print_exc()
                    await websocket.send(json.dumps({
                        'type': 'error',
                        'message': str(e)
                    }))
        
        except websockets.exceptions.ConnectionClosed:
            print(f"Client disconnected: {client_id}")
        finally:
            # Cleanup session
            if str(client_id) in self.active_sessions:
                del self.active_sessions[str(client_id)]


# RealtimeActionCounter class unchanged (assume it's defined)
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
        self.max_history = 30
        
    def update(self, action_score):
        """Cập nhật state và đếm số lần lặp lại"""
        # Smooth prediction với momentum
        self.classify_prob = action_score * (1.0 - self.momentum) + self.momentum * self.classify_prob
        
        # Lưu vào history
        self.confidence_history.append(self.classify_prob)
        if len(self.confidence_history) > self.max_history:
            self.confidence_history.pop(0)
        
        # Check triggers
        salient1_triggered = self.repetition_salient_1(self.classify_prob)
        reverse_classify_prob = 1 - self.classify_prob
        salient2_triggered = self.repetition_salient_2(reverse_classify_prob)
        
        # Xác định initial pose
        if self.init_pose == 'pose_holder':
            if salient1_triggered:
                self.init_pose = 'salient1'
            elif salient2_triggered:
                self.init_pose = 'salient2'
        
        # Đếm transitions
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
        """Reset counter"""
        self.pose_count = 0
        self.curr_pose = 'holder'
        self.init_pose = 'pose_holder'
        self.classify_prob = 0.5
        self.confidence_history = []
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


async def main():
    # Initialize server
    server = PoseDetectionServer(
        model_path='best_weights_PoseRAC.pth',
        csv_path='all_action.csv'
    )
    
    # Start WebSocket server
    host = '0.0.0.0'  # Listen on all interfaces (access via 192.168.1.16:8765)
    port = 8765
    
    print(f"\n{'='*60}")
    print(f"WebSocket Server starting on ws://{host}:{port}")
    print(f"Access from client: ws://192.168.1.28:{port} (or your local IP)")
    print(f"{'='*60}\n")
    print("Waiting for connections...")
    
    async with websockets.serve(server.handle_client, host, port, 
                                max_size=10 * 1024 * 1024,  # 10MB max message size
                                ping_interval=20,
                                ping_timeout=20):
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")