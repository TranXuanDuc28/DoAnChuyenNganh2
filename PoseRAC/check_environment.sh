#!/bin/bash
# Test script để kiểm tra môi trường đã setup đúng chưa

echo "=========================================="
echo "POSERAC - Environment Check"
echo "=========================================="
echo ""

# Check Python version
echo "1. Checking Python version..."
python --version
if [ $? -ne 0 ]; then
    echo "❌ Python not found!"
    exit 1
fi
echo "✅ Python OK"
echo ""

# Check required files
echo "2. Checking required files..."

if [ -f "video_inference_streaming.py" ]; then
    echo "✅ video_inference_streaming.py found"
else
    echo "❌ video_inference_streaming.py NOT found!"
    exit 1
fi

if [ -f "model.py" ]; then
    echo "✅ model.py found"
else
    echo "❌ model.py NOT found!"
    exit 1
fi

if [ -f "all_action.csv" ]; then
    echo "✅ all_action.csv found"
else
    echo "❌ all_action.csv NOT found!"
    exit 1
fi

if [ -f "best_weights_PoseRAC.pth" ]; then
    echo "✅ best_weights_PoseRAC.pth found"
else
    echo "❌ best_weights_PoseRAC.pth NOT found!"
    echo "   This file is REQUIRED! Please download it."
    exit 1
fi

echo ""
echo "3. Checking Python packages..."

# Check packages
python -c "import cv2; print('✅ opencv-python installed')" 2>/dev/null || echo "❌ opencv-python NOT installed"
python -c "import mediapipe; print('✅ mediapipe installed')" 2>/dev/null || echo "❌ mediapipe NOT installed"
python -c "import torch; print('✅ torch installed')" 2>/dev/null || echo "❌ torch NOT installed"
python -c "import pandas; print('✅ pandas installed')" 2>/dev/null || echo "❌ pandas NOT installed"
python -c "import numpy; print('✅ numpy installed')" 2>/dev/null || echo "❌ numpy NOT installed"

echo ""
echo "4. Checking GPU availability..."
python -c "import torch; print('✅ GPU available:', torch.cuda.is_available())" 2>/dev/null

echo ""
echo "=========================================="
echo "Environment check complete!"
echo "=========================================="
echo ""
echo "If all checks passed, you can run:"
echo "  python video_inference_streaming.py --video YOUR_VIDEO.mp4"
echo ""
