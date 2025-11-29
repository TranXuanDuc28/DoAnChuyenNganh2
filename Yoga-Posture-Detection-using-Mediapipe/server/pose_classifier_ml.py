"""
ML-based Pose Classifier for Yoga Poses
Uses trained neural network model for classification
"""

import torch
import cv2
import mediapipe as mp
import numpy as np
import os
import json
import sys

# Add ml_model to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml_model'))
from yoga_model import YogaPoseClassifier

mp_pose = mp.solutions.pose

class PoseClassifierML:
    """ML-based pose classifier using trained neural network"""
    
    def __init__(self, model_path=None, config_path=None):
        """
        Initialize ML classifier
        Args:
            model_path: Path to trained model weights (.pth file)
            config_path: Path to pose_references.json
        """
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Default paths
        if model_path is None:
            model_path = os.path.join(script_dir, 'ml_model', 'best_model.pth')
        if config_path is None:
            config_path = os.path.join(script_dir, 'pose_references.json')
        
        # Load label mapping
        label_mapping_path = os.path.join(script_dir, 'ml_model', 'label_mapping.json')
        with open(label_mapping_path, 'r') as f:
            label_mapping = json.load(f)
        
        # Convert string keys to int
        self.label_mapping = {int(k): v for k, v in label_mapping.items()}
        self.num_classes = len(self.label_mapping)
        
        # Load pose references (for metadata)
        with open(config_path, 'r', encoding='utf-8') as f:
            self.pose_references = json.load(f)
        
        # Load model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = YogaPoseClassifier(input_dim=99, num_classes=self.num_classes)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        
        # Don't print anything - keep stdout clean for JSON output
    
    def extract_keypoints(self, image_path):
        """
        Extract keypoints from image using MediaPipe
        Args:
            image_path: Path to image file
        Returns:
            numpy array of shape (99,) or None if pose not detected
        """
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        with mp_pose.Pose(min_detection_confidence=0.5,
                         min_tracking_confidence=0.5) as pose:
            results = pose.process(image_rgb)
            
            if not results.pose_landmarks:
                return None
            
            landmarks = results.pose_landmarks.landmark
            keypoints = []
            for lm in landmarks:
                keypoints.extend([lm.x, lm.y, lm.z])
            
            return np.array(keypoints, dtype=np.float32)
    
    def normalize_keypoints(self, keypoints):
        """
        Normalize keypoints to [0, 1] range
        Args:
            keypoints: numpy array of shape (99,)
        Returns:
            normalized keypoints
        """
        # Reshape to (33, 3)
        keypoints_reshaped = keypoints.reshape(33, 3)
        
        # Normalize each dimension
        x_coords = keypoints_reshaped[:, 0]
        y_coords = keypoints_reshaped[:, 1]
        z_coords = keypoints_reshaped[:, 2]
        
        x_min, x_max = x_coords.min(), x_coords.max()
        y_min, y_max = y_coords.min(), y_coords.max()
        z_min, z_max = z_coords.min(), z_coords.max()
        
        if x_max > x_min:
            keypoints_reshaped[:, 0] = (x_coords - x_min) / (x_max - x_min)
        if y_max > y_min:
            keypoints_reshaped[:, 1] = (y_coords - y_min) / (y_max - y_min)
        if z_max > z_min:
            keypoints_reshaped[:, 2] = (z_coords - z_min) / (z_max - z_min)
        
        return keypoints_reshaped.reshape(99)
    
    def classify_pose(self, image_path):
        """
        Classify yoga pose from image
        Args:
            image_path: Path to image file
        Returns:
            dict with classification results
        """
        # Extract keypoints
        keypoints = self.extract_keypoints(image_path)
        
        if keypoints is None:
            return {
                "success": False,
                "message": "Could not detect pose in image"
            }
        
        # Normalize keypoints
        keypoints_normalized = self.normalize_keypoints(keypoints)
        
        # Convert to tensor
        input_tensor = torch.FloatTensor(keypoints_normalized).unsqueeze(0).to(self.device)
        
        # Predict
        with torch.no_grad():
            probs = self.model.predict_proba(input_tensor)
            pred_class = torch.argmax(probs, dim=1).item()
            confidence = probs[0, pred_class].item()
        
        # Get pose name
        pose_name = self.label_mapping[pred_class]
        
        # Get pose info from references
        pose_info = self.pose_references.get(pose_name, {
            "name": pose_name,
            "name_vi": pose_name,
            "reference_image": f"reference_poses/{pose_name}.jpg"
        })
        
        # Get reference image path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        reference_image = os.path.join(script_dir, pose_info["reference_image"])
        
        return {
            "success": True,
            "pose_name": pose_name,
            "pose_info": pose_info,
            "confidence": confidence,
            "reference_image": reference_image,
            "all_probabilities": {
                self.label_mapping[i]: float(probs[0, i].item())
                for i in range(self.num_classes)
            }
        }

if __name__ == "__main__":
    # Test classifier
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python pose_classifier_ml.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    classifier = PoseClassifierML()
    result = classifier.classify_pose(image_path)
    
    print("\nClassification Result:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
