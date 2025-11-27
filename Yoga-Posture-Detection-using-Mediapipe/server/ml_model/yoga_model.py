"""
Yoga Pose Classification Model
Simple neural network for classifying 8 yoga poses
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class YogaPoseClassifier(nn.Module):
    """
    Neural network for yoga pose classification
    
    Architecture:
        Input: 99 features (33 landmarks × 3 coordinates)
        Hidden Layer 1: 256 neurons + ReLU + Dropout(0.3)
        Hidden Layer 2: 128 neurons + ReLU + Dropout(0.3)
        Output: 8 classes (softmax)
    """
    
    def __init__(self, input_dim=99, num_classes=8, dropout_rate=0.3):
        super(YogaPoseClassifier, self).__init__()
        
        self.fc1 = nn.Linear(input_dim, 256)
        self.dropout1 = nn.Dropout(dropout_rate)
        
        self.fc2 = nn.Linear(256, 128)
        self.dropout2 = nn.Dropout(dropout_rate)
        
        self.fc3 = nn.Linear(128, num_classes)
        
    def forward(self, x):
        """
        Forward pass
        Args:
            x: Input tensor of shape (batch_size, 99)
        Returns:
            Output logits of shape (batch_size, 8)
        """
        x = F.relu(self.fc1(x))
        x = self.dropout1(x)
        
        x = F.relu(self.fc2(x))
        x = self.dropout2(x)
        
        x = self.fc3(x)
        return x
    
    def predict_proba(self, x):
        """
        Get class probabilities
        Args:
            x: Input tensor of shape (batch_size, 99)
        Returns:
            Probabilities of shape (batch_size, 8)
        """
        logits = self.forward(x)
        return F.softmax(logits, dim=1)
    
    def predict(self, x):
        """
        Get predicted class
        Args:
            x: Input tensor of shape (batch_size, 99)
        Returns:
            Predicted class indices
        """
        probs = self.predict_proba(x)
        return torch.argmax(probs, dim=1)

if __name__ == "__main__":
    # Test model
    model = YogaPoseClassifier()
    print("Model Architecture:")
    print(model)
    print(f"\nTotal parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Test forward pass
    batch_size = 4
    test_input = torch.randn(batch_size, 99)
    output = model(test_input)
    print(f"\nTest input shape: {test_input.shape}")
    print(f"Test output shape: {output.shape}")
    
    # Test prediction
    probs = model.predict_proba(test_input)
    preds = model.predict(test_input)
    print(f"Probabilities shape: {probs.shape}")
    print(f"Predictions: {preds}")
