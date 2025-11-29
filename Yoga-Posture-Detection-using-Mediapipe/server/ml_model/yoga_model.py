"""
Yoga Pose Classification Model
Simple neural network for classifying 8 yoga poses
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class YogaPoseClassifier(nn.Module):

    
    def __init__(self, input_dim=99, num_classes=8, dropout_rate=0.3):
        super(YogaPoseClassifier, self).__init__()
        
        self.fc1 = nn.Linear(input_dim, 256)
        self.dropout1 = nn.Dropout(dropout_rate)
        
        self.fc2 = nn.Linear(256, 128)
        self.dropout2 = nn.Dropout(dropout_rate)
        
        self.fc3 = nn.Linear(128, num_classes)
        
    def forward(self, x):

        x = F.relu(self.fc1(x))
        x = self.dropout1(x)
        
        x = F.relu(self.fc2(x))
        x = self.dropout2(x)
        
        x = self.fc3(x)
        return x
    
    def predict_proba(self, x):
   
        logits = self.forward(x)
        return F.softmax(logits, dim=1)
    
    def predict(self, x):
      
        probs = self.predict_proba(x)
        return torch.argmax(probs, dim=1)

if __name__ == "__main__":
    model = YogaPoseClassifier()
    print("Model Architecture:")
    print(model)
    print(f"\nTotal parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    batch_size = 4
    test_input = torch.randn(batch_size, 99)
    output = model(test_input)
    print(f"\nTest input shape: {test_input.shape}")
    print(f"Test output shape: {output.shape}")
    
        
    probs = model.predict_proba(test_input)
    preds = model.predict(test_input)
    print(f"Probabilities shape: {probs.shape}")
    print(f"Predictions: {preds}")
