"""
Data Preparation Script for Yoga Pose Classification
Reads CSV files from Yoga_Poses-Dataset and prepares training/validation data
"""

import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
import json

# Pose names mapping
POSE_NAMES = [
    "ArdhaChandrasana",
    "BaddhaKonasana",
    "Downward_Dog",
    "Natarajasana",
    "Triangle",
    "UtkataKonasana",
    "Veerabhadrasana",
    "Vrukshasana"
]

def load_csv_data(csv_path):
    """
    Load landmarks data from CSV file
    Args:
        csv_path: Path to CSV file
    Returns:
        numpy array of shape (n_samples, 99) - 33 landmarks × 3 coordinates (x,y,z)
    """
    df = pd.read_csv(csv_path)
    
    # Extract only x, y, z columns (skip visibility)
    # Columns are: NOSE_x, NOSE_y, NOSE_z, NOSE_vis, LEFT_EYE_INNER_x, ...
    xyz_columns = []
    for col in df.columns:
        if col.endswith('_x') or col.endswith('_y') or col.endswith('_z'):
            xyz_columns.append(col)
    
    # Extract data
    data = df[xyz_columns].values
    
    print(f"Loaded {len(data)} samples from {os.path.basename(csv_path)}")
    return data

def normalize_landmarks(landmarks):
    """
    Normalize landmarks to [0, 1] range
    Args:
        landmarks: numpy array of shape (n_samples, 99)
    Returns:
        normalized landmarks
    """
    # Reshape to (n_samples, 33, 3) for easier processing
    n_samples = landmarks.shape[0]
    landmarks_reshaped = landmarks.reshape(n_samples, 33, 3)
    
    # Normalize each sample independently
    for i in range(n_samples):
        # Get min/max for each dimension
        x_coords = landmarks_reshaped[i, :, 0]
        y_coords = landmarks_reshaped[i, :, 1]
        z_coords = landmarks_reshaped[i, :, 2]
        
        # Normalize to [0, 1]
        x_min, x_max = x_coords.min(), x_coords.max()
        y_min, y_max = y_coords.min(), y_coords.max()
        z_min, z_max = z_coords.min(), z_coords.max()
        
        if x_max > x_min:
            landmarks_reshaped[i, :, 0] = (x_coords - x_min) / (x_max - x_min)
        if y_max > y_min:
            landmarks_reshaped[i, :, 1] = (y_coords - y_min) / (y_max - y_min)
        if z_max > z_min:
            landmarks_reshaped[i, :, 2] = (z_coords - z_min) / (z_max - z_min)
    
    # Reshape back to (n_samples, 99)
    return landmarks_reshaped.reshape(n_samples, 99)

def prepare_dataset(dataset_root):
    """
    Prepare training and validation datasets
    Args:
        dataset_root: Path to Yoga_Poses-Dataset/Results directory
    Returns:
        X_train, X_val, y_train, y_val, label_mapping
    """
    all_data = []
    all_labels = []
    
    # Load data from each pose
    for idx, pose_name in enumerate(POSE_NAMES):
        csv_file = os.path.join(dataset_root, f"Dataset_{pose_name}.csv")
        
        if not os.path.exists(csv_file):
            print(f"Warning: {csv_file} not found, skipping...")
            continue
        
        # Load landmarks
        landmarks = load_csv_data(csv_file)
        
        # Create labels
        labels = np.full(len(landmarks), idx, dtype=np.int64)
        
        all_data.append(landmarks)
        all_labels.append(labels)
    
    # Concatenate all data
    X = np.vstack(all_data)
    y = np.concatenate(all_labels)
    
    print(f"\nTotal samples: {len(X)}")
    print(f"Feature shape: {X.shape}")
    print(f"Label distribution:")
    for idx, pose_name in enumerate(POSE_NAMES):
        count = np.sum(y == idx)
        print(f"  {pose_name}: {count} samples")
    
    # Normalize landmarks
    print("\nNormalizing landmarks...")
    X_normalized = normalize_landmarks(X)
    
    # Split train/validation (80/20)
    print("\nSplitting train/validation (80/20)...")
    X_train, X_val, y_train, y_val = train_test_split(
        X_normalized, y, 
        test_size=0.2, 
        random_state=42,
        stratify=y  # Ensure balanced split
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Validation samples: {len(X_val)}")
    
    # Create label mapping
    label_mapping = {idx: name for idx, name in enumerate(POSE_NAMES)}
    
    return X_train, X_val, y_train, y_val, label_mapping

def save_processed_data(X_train, X_val, y_train, y_val, label_mapping, output_dir):
    """
    Save processed data to files
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Save numpy arrays
    np.savez(
        os.path.join(output_dir, 'train_data.npz'),
        X=X_train,
        y=y_train
    )
    
    np.savez(
        os.path.join(output_dir, 'val_data.npz'),
        X=X_val,
        y=y_val
    )
    
    # Save label mapping
    with open(os.path.join(output_dir, 'label_mapping.json'), 'w') as f:
        json.dump(label_mapping, f, indent=2)
    
    print(f"\nData saved to {output_dir}/")
    print(f"  - train_data.npz: {len(X_train)} samples")
    print(f"  - val_data.npz: {len(X_val)} samples")
    print(f"  - label_mapping.json")

if __name__ == "__main__":
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_root = os.path.join(
        os.path.dirname(script_dir),
        "..", "Yoga_Poses-Dataset", "Results"
    )
    dataset_root = os.path.normpath(dataset_root)
    output_dir = script_dir
    
    print("="*60)
    print("Yoga Pose Dataset Preparation")
    print("="*60)
    print(f"Dataset root: {dataset_root}")
    print(f"Output directory: {output_dir}")
    print()
    
    # Prepare dataset
    X_train, X_val, y_train, y_val, label_mapping = prepare_dataset(dataset_root)
    
    # Save processed data
    save_processed_data(X_train, X_val, y_train, y_val, label_mapping, output_dir)
    
    print("\n" + "="*60)
    print("Data preparation complete!")
    print("="*60)
