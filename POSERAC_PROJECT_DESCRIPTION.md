# 🏋️ PoseRAC: Pose Saliency Transformer for Repetitive Action Counting

## 📋 Tổng quan Project

**PoseRAC** là một model AI tiên tiến được thiết kế để **đếm số lần lặp lại của các động tác thể dục** từ video. Đây là **phương pháp đầu tiên sử dụng pose-level** (mức độ tư thế) thay vì video-level truyền thống, giúp tăng hiệu suất và tốc độ xử lý đáng kể.

---

## 🎯 Mục đích

### Vấn đề cần giải quyết:
- **Đếm tự động số lần lặp lại động tác** trong video tập luyện (squat, push-up, pull-up, v.v.)
- Các phương pháp truyền thống (video-level) **chậm, tốn kém tài nguyên** và cần GPU mạnh
- Thiếu dataset có **annotation ở mức độ pose** (tư thế cơ thể)

### Giải pháp của PoseRAC:
- ✅ **Pose-level method**: Chỉ phân tích skeleton (33 keypoints) thay vì toàn bộ video
- ✅ **Nhanh gấp 10 lần** so với phương pháp state-of-the-art trước đó (TransRAC)
- ✅ **Nhẹ**: Có thể train trên CPU trong 1.5 giờ (không cần GPU)
- ✅ **Chính xác cao**: OBO metric 0.56 so với 0.29 của TransRAC

---

## 🏆 Thành tựu

### So sánh với các phương pháp khác (trên RepCount dataset):

| Method | MAE ↓ | OBO ↑ | Time (ms/frame) |
|--------|-------|-------|-----------------|
| RepNet | 0.995 | 0.013 | 100 |
| X3D | 0.911 | 0.106 | 220 |
| TransRAC | 0.443 | 0.291 | 200 |
| **PoseRAC (Ours)** | **0.236** | **0.560** | **20** |

**Giải thích metrics:**
- **MAE (Mean Absolute Error)**: Sai số trung bình - càng thấp càng tốt
- **OBO (Off-By-One)**: Tỷ lệ dự đoán sai lệch ≤ 1 lần - càng cao càng tốt
- **Time**: Thời gian xử lý mỗi frame - càng thấp càng nhanh

**Kết quả:** PoseRAC vượt trội về cả **độ chính xác** và **tốc độ**!

---

## 🧠 Kiến trúc Model

### 1. **Input: Pose Landmarks**
- Sử dụng **MediaPipe** để trích xuất **33 keypoints** từ mỗi frame
- Mỗi keypoint có **3 chiều** (x, y, z) → Tổng **99 features** cho mỗi pose

```
Keypoints: Đầu, vai, khuỷu tay, cổ tay, hông, đầu gối, mắt cá chân, v.v.
```

### 2. **Model Architecture: Transformer Encoder**

```python
PoseRAC Model:
├── Input: Pose landmarks (99 dimensions)
├── Transformer Encoder
│   ├── Multi-head Attention (heads=8)
│   ├── Feed Forward Network
│   └── Layer Normalization
├── Fully Connected Layer
└── Output: Probability cho mỗi action class (8 classes)
```

**Thành phần chính:**
- **Transformer Encoder**: Học mối quan hệ giữa các keypoints
- **Multi-head Attention**: Tập trung vào các keypoints quan trọng
- **Triplet Loss + BCE Loss**: Kết hợp metric learning và classification

### 3. **Action Trigger Mechanism**

```python
Action_trigger:
├── Enter Threshold: 0.78 (vào salient pose)
├── Exit Threshold: 0.4 (thoát salient pose)
└── Counting Logic: Đếm khi chuyển từ pose 1 → pose 2
```

**Cách hoạt động:**
1. Model dự đoán xác suất cho mỗi pose (salient pose 1 hoặc 2)
2. Khi xác suất > enter_threshold → Vào pose
3. Khi xác suất < exit_threshold → Thoát pose
4. Đếm 1 rep khi chuyển từ pose 1 → pose 2 (hoặc ngược lại)

---

## 📊 Dataset: RepCount-pose

### Đóng góp mới:
PoseRAC tạo ra **RepCount-pose** - phiên bản mới của RepCount dataset với:
- **Pose Saliency Annotation**: Annotation 2 tư thế quan trọng nhất (salient poses) cho mỗi action
- Ví dụ: Squat có 2 salient poses:
  - **Pose 1**: Đứng thẳng (đầu động tác)
  - **Pose 2**: Ngồi xổm (cuối động tác)

### Cấu trúc dataset:

```
RepCount_pose/
├── annotation/
│   ├── pose_train.csv      # Annotation cho pose-level training
│   ├── video_train.csv     # Annotation cho video-level training
│   ├── test.csv            # Test set
│   └── valid.csv           # Validation set
├── video/
│   ├── train/              # Training videos
│   ├── test/               # Test videos
│   └── valid/              # Validation videos
└── test_poses/             # Pre-extracted poses cho test set
```

---

## 🔧 Các thành phần chính của Code

### 1. **model.py** - Model Architecture

```python
class PoseRAC(pl.LightningModule):
    """
    Model chính sử dụng Transformer Encoder
    - Input: 99 features (33 keypoints × 3 dimensions)
    - Output: Probability cho 8 action classes
    """
    
class Action_trigger:
    """
    Cơ chế đếm số lần lặp lại
    - Sử dụng 2 thresholds (enter/exit)
    - Đếm khi chuyển giữa 2 salient poses
    """
```

### 2. **train.py** - Training Script

**Quy trình training:**
1. Load pose landmarks từ CSV annotation
2. Normalize landmarks (scale về [0, 1])
3. Train model với:
   - **Triplet Loss**: Học embedding space tốt hơn
   - **BCE Loss**: Classification loss
   - **Combined Loss**: α × Triplet + (1-α) × BCE
4. Save best checkpoint

**Hyperparameters:**
- Learning rate: Auto-tuned với PyTorch Lightning
- Batch size: 16
- Optimizer: Adam
- Scheduler: ReduceLROnPlateau
- Early stopping: Patience 20 epochs

### 3. **eval.py** - Evaluation Script

**Quy trình evaluation:**
1. Load pre-extracted poses từ test set
2. Chạy model inference cho mỗi video
3. Thử tất cả 8 action classes
4. Chọn action có MAE thấp nhất
5. Tính MAE và OBO metrics

### 4. **video_inference_streaming.py** - Inference cho Video mới

**Quy trình inference:**
1. **Extract poses**: Dùng MediaPipe để trích xuất 33 keypoints từ mỗi frame
2. **Normalize**: Chuẩn hóa landmarks về [0, 1]
3. **Model prediction**: Chạy model cho mỗi pose
4. **Action counting**: Dùng Action_trigger để đếm reps
5. **Visualization**: Vẽ skeleton + graph + counter lên video

**Tối ưu hóa:**
- Streaming processing: Không load toàn bộ video vào RAM
- Auto resize: Video 4K → 720p để tăng tốc
- GPU/CPU support: Tự động detect và sử dụng

---

## 🎬 Các động tác được hỗ trợ

| # | Action | Mô tả | Ví dụ |
|---|--------|-------|-------|
| 0 | **front_raise** | Nâng tạ trước | Nâng tạ từ đùi lên ngang vai |
| 1 | **pull_up** | Kéo xà | Kéo người lên xà đơn |
| 2 | **squat** | Gập bụng | Ngồi xổm đứng lên |
| 3 | **bench_pressing** | Đẩy tạ nằm | Nằm đẩy tạ lên |
| 4 | **jump_jack** | Bật nhảy | Nhảy tách chân vỗ tay |
| 5 | **situp** | Gập bụng | Nằm gập bụng ngồi dậy |
| 6 | **push_up** | Chống đẩy | Chống đẩy sàn |
| 7 | **pommelhorse** | Ngựa yên | Động tác thể dục dụng cụ |

---

## 💻 Yêu cầu hệ thống

### Minimum:
- **OS**: Linux/Windows/macOS
- **Python**: 3.8 - 3.12
- **RAM**: 8GB
- **CPU**: Intel Core i5 hoặc tương đương
- **Disk**: 5GB

### Recommended:
- **RAM**: 16GB
- **GPU**: NVIDIA GPU với CUDA (GTX 1060 trở lên)
- **CPU**: Intel Core i7 hoặc AMD Ryzen 7

---

## 📦 Dependencies

```txt
pyyaml                      # Config file parsing
pytorch-lightning==1.9.2    # Training framework
pytorch-metric-learning     # Triplet loss
pandas                      # Data processing
mediapipe                   # Pose extraction
opencv-python               # Video processing
torch                       # Deep learning framework
numpy                       # Numerical computing
matplotlib                  # Visualization
pillow                      # Image processing
```

---

## 🚀 Cách sử dụng

### 1. **Training từ đầu**

```bash
# Bước 1: Preprocess training data
python pre_train.py --config RepCount_pose_config.yaml

# Bước 2: Train model
python train.py --config RepCount_pose_config.yaml

# Kết quả: Model weights được lưu vào saved_weights/
```

### 2. **Evaluation trên test set**

```bash
# Optional: Extract poses từ test videos
python pre_test.py --config RepCount_pose_config.yaml

# Evaluate với pre-trained weights
python eval.py --config RepCount_pose_config.yaml --ckpt best_weights_PoseRAC.pth

# Output: MAE: 0.236, OBO: 0.560
```

### 3. **Inference video mới**

```bash
# Cách 1: Inference đơn giản (chỉ đếm, không tạo video)
python simple_inference_optimized.py --video your_video.mp4

# Cách 2: Inference với visualization (tạo video output)
python video_inference_streaming.py --video your_video.mp4

# Cách 3: Bắt buộc dùng CPU
python video_inference_streaming.py --video your_video.mp4 --cpu

# Cách 4: Điều chỉnh thresholds
python video_inference_streaming.py \
    --video your_video.mp4 \
    --enter_threshold 0.8 \
    --exit_threshold 0.4
```

---

## 🎨 Output Visualization

Video output sẽ có:

1. **Skeleton overlay**: 33 keypoints được vẽ lên người
2. **Confidence graph**: Biểu đồ xác suất theo thời gian (góc trái trên)
3. **Rep counter**: Số đếm real-time (góc phải trên)
4. **Action name**: Tên động tác được nhận diện (góc trái dưới)
5. **Confidence score**: Điểm tin cậy (góc trái dưới)

```
┌─────────────────────────────────────┐
│ [Graph]              [Counter: 6]   │
│                                     │
│         [Skeleton on person]        │
│                                     │
│ squat (0.529)                       │
└─────────────────────────────────────┘
```

---

## 🔬 Kỹ thuật nổi bật

### 1. **Pose Saliency Annotation**
- Thay vì annotate toàn bộ video, chỉ annotate 2 tư thế quan trọng nhất
- Giảm công sức annotation, tăng hiệu quả training

### 2. **Transformer Encoder**
- Học mối quan hệ giữa các keypoints
- Multi-head attention giúp tập trung vào các keypoints quan trọng

### 3. **Metric Learning + Classification**
- **Triplet Loss**: Học embedding space tốt hơn (poses giống nhau gần nhau)
- **BCE Loss**: Classification accuracy
- **Combined**: α × Triplet + (1-α) × BCE

### 4. **Two-threshold Counting**
- **Enter threshold** (0.78): Ngưỡng để vào pose
- **Exit threshold** (0.4): Ngưỡng để thoát pose
- Giảm false counts do prediction jitter

### 5. **Momentum Smoothing**
- Smooth predictions theo thời gian
- `prob_t = prob_t × (1-momentum) + prob_{t-1} × momentum`
- Giảm nhiễu, tăng ổn định

---

## 📈 Performance Benchmarks

### Training Speed:
- **GPU (NVIDIA RTX 3090)**: ~20 phút
- **CPU (Intel i7)**: ~1.5 giờ
- **Memory**: ~2GB RAM

### Inference Speed (video 30 giây, 30fps):
- **GPU**: ~2-3 phút
- **CPU**: ~5-10 phút
- **Memory**: ~1GB RAM

### Model Size:
- **Weights**: ~1.5MB (rất nhẹ!)
- **Parameters**: ~100K parameters

---

## 🔍 So sánh với các phương pháp khác

| Aspect | Video-level (TransRAC) | Pose-level (PoseRAC) |
|--------|------------------------|----------------------|
| **Input** | RGB frames (1920×1080×3) | Pose landmarks (33×3) |
| **Feature size** | ~6M pixels/frame | 99 numbers/frame |
| **Model** | Video Transformer | Pose Transformer |
| **Parameters** | ~10M | ~100K |
| **Training time** | ~10 giờ (GPU) | ~20 phút (GPU) |
| **Inference speed** | 200ms/frame | 20ms/frame |
| **Accuracy (OBO)** | 0.29 | 0.56 |

**Kết luận**: PoseRAC nhanh hơn, nhẹ hơn, và chính xác hơn!

---

## 🎓 Kiến thức cần thiết

### Để hiểu code:
- **Python**: OOP, decorators, context managers
- **PyTorch**: Tensors, models, training loop
- **PyTorch Lightning**: LightningModule, Trainer
- **Computer Vision**: Pose estimation, keypoints
- **Deep Learning**: Transformers, attention mechanism

### Để modify/extend:
- **Transformers**: Self-attention, multi-head attention
- **Metric Learning**: Triplet loss, contrastive learning
- **Video Processing**: OpenCV, frame extraction
- **Pose Estimation**: MediaPipe, keypoint detection

---

## 📝 File Structure

```
PoseRAC/
├── 📄 Core Files (BẮT BUỘC)
│   ├── model.py                         # Model architecture
│   ├── train.py                         # Training script
│   ├── eval.py                          # Evaluation script
│   ├── all_action.csv                   # Action labels
│   └── best_weights_PoseRAC.pth         # Pre-trained weights
│
├── 🎬 Inference Files
│   ├── video_inference_streaming.py     # Full inference + visualization
│   ├── simple_inference_optimized.py    # Fast inference (no video)
│   ├── image_inference.py               # Single image inference
│   └── camera_realtime_inference.py     # Webcam real-time
│
├── 🛠️ Utility Files
│   ├── pre_train.py                     # Preprocess training data
│   ├── pre_test.py                      # Extract test poses
│   ├── export_to_onnx.py                # Export to ONNX format
│   └── utils/                           # Helper functions
│
├── 📚 Documentation
│   ├── README.md                        # Original README
│   ├── SETUP_GUIDE.md                   # Setup guide
│   ├── QUICKSTART.md                    # Quick start
│   ├── README_INFERENCE.md              # Inference guide
│   └── FILES_OVERVIEW.md                # File overview
│
└── ⚙️ Config
    ├── RepCount_pose_config.yaml        # Config file
    ├── requirements.txt                 # Dependencies
    └── requirements_inference.txt       # Inference-only deps
```

---

## 🌟 Điểm mạnh của PoseRAC

### 1. **Hiệu suất vượt trội**
- ✅ Chính xác nhất trên RepCount dataset (OBO: 0.56)
- ✅ Nhanh gấp 10 lần so với TransRAC
- ✅ Nhẹ hơn 100 lần về số parameters

### 2. **Dễ train**
- ✅ Train được trên CPU (1.5 giờ)
- ✅ Không cần GPU mạnh
- ✅ Ít data hơn (chỉ cần annotate 2 salient poses)

### 3. **Dễ deploy**
- ✅ Model nhẹ (~1.5MB)
- ✅ Inference nhanh (20ms/frame)
- ✅ Chạy được trên mobile/edge devices

### 4. **Robust**
- ✅ Hoạt động tốt với nhiều góc quay
- ✅ Không bị ảnh hưởng bởi background
- ✅ Ổn định với lighting conditions khác nhau

---

## ⚠️ Hạn chế

### 1. **Phụ thuộc vào pose detection**
- ❌ Nếu MediaPipe không detect được pose → Không đếm được
- ❌ Cần người trong khung hình rõ ràng

### 2. **Chỉ hỗ trợ 8 actions**
- ❌ Cần retrain nếu muốn thêm action mới
- ❌ Không generalize cho actions chưa thấy

### 3. **Cần 2 salient poses rõ ràng**
- ❌ Không hoạt động tốt với động tác liên tục không có điểm dừng
- ❌ Khó với động tác phức tạp có nhiều biến thể

---

## 🔮 Hướng phát triển

### 1. **Mở rộng số actions**
- Thêm nhiều động tác thể dục khác
- Support cho yoga poses
- Support cho dance moves

### 2. **Real-time mobile app**
- Deploy lên iOS/Android
- Tích hợp với fitness apps
- Personal trainer AI

### 3. **Form correction**
- Không chỉ đếm mà còn chỉnh sửa tư thế
- Feedback real-time
- Injury prevention

### 4. **Multi-person support**
- Đếm cho nhiều người cùng lúc
- Group workout tracking
- Competition mode

---

## 📖 Paper Reference

**Title**: PoseRAC: Pose Saliency Transformer for Repetitive Action Counting  
**Authors**: Ziyu Yao, Xuxin Cheng, Yuexian Zou  
**Published**: arXiv 2023  
**Link**: https://arxiv.org/abs/2303.08450

**Citation:**
```bibtex
@article{yao2023poserac,
  title={PoseRAC: Pose Saliency Transformer for Repetitive Action Counting},
  author={Yao, Ziyu and Cheng, Xuxin and Zou, Yuexian},
  journal={arXiv preprint arXiv:2303.08450},
  year={2023}
}
```

---

## 🎯 Use Cases

### 1. **Fitness Apps**
- Đếm tự động số lần tập
- Track workout progress
- Virtual personal trainer

### 2. **Physical Therapy**
- Monitor rehabilitation exercises
- Ensure correct form
- Track recovery progress

### 3. **Sports Training**
- Analyze athlete performance
- Count repetitions automatically
- Technique analysis

### 4. **Research**
- Benchmark cho repetitive action counting
- Baseline cho pose-level methods
- Dataset annotation tool

---

## 🛠️ Troubleshooting

### Lỗi thường gặp:

**1. CUDA out of memory**
```bash
# Solution: Dùng CPU
python video_inference_streaming.py --video video.mp4 --cpu
```

**2. MediaPipe không detect được pose**
```bash
# Solution: Cải thiện chất lượng video
- Quay rõ toàn thân
- Ánh sáng tốt
- Người trong khung hình rõ ràng
```

**3. Đếm không chính xác**
```bash
# Solution: Điều chỉnh thresholds
python video_inference_streaming.py \
    --video video.mp4 \
    --enter_threshold 0.7 \  # Thấp hơn = dễ vào pose hơn
    --exit_threshold 0.3     # Thấp hơn = dễ thoát pose hơn
```

**4. Model load lỗi**
```bash
# Solution: Kiểm tra file weights
ls -lh best_weights_PoseRAC.pth  # Phải ~1.5MB
```

---

## 📊 Kết luận

**PoseRAC** là một breakthrough trong lĩnh vực repetitive action counting:

✅ **Chính xác**: OBO 0.56 (tốt nhất trên RepCount)  
✅ **Nhanh**: 20ms/frame (nhanh gấp 10 lần)  
✅ **Nhẹ**: 1.5MB model (nhẹ gấp 100 lần)  
✅ **Dễ dùng**: Inference 1 dòng lệnh  
✅ **Practical**: Deploy được lên mobile/edge  

**Phù hợp cho:**
- Fitness apps
- Physical therapy
- Sports training
- Research

**Không phù hợp cho:**
- Actions không có salient poses rõ ràng
- Video chất lượng kém (không detect được pose)
- Real-time trên hardware yếu (cần tối ưu thêm)

---

**Tác giả mô tả:** AI Assistant  
**Ngày:** 2025-11-27  
**Phiên bản:** 1.0  
**Model gốc:** PoseRAC (Yao et al., 2023)



