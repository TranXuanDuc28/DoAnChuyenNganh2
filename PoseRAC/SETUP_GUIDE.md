# PoseRAC - Hướng Dẫn Cài Đặt và Sử Dụng

## 📋 Giới Thiệu

PoseRAC là model AI nhận diện và đếm số lần lặp lại của các động tác thể dục từ video.

**Các động tác được hỗ trợ:**
- front_raise (nâng tạ trước)
- pull_up (kéo xà)
- squat (gập bụng)
- bench_pressing (đẩy tạ)
- jump_jack (bật nhảy)
- situp (gập bụng)
- push_up (chống đẩy)
- pommelhorse (ngựa yên)

**Input:** Chỉ cần 1 video chứa động tác

**Output:** 
- Video có visualization (skeleton + graph + counter)
- Số lần lặp lại động tác
- Loại động tác được nhận diện

---

## 🖥️ Yêu Cầu Hệ Thống

- **OS:** Linux (Ubuntu/Debian) hoặc Windows với WSL
- **Python:** 3.8 - 3.12
- **RAM:** Tối thiểu 8GB (khuyến nghị 16GB)
- **GPU:** Tùy chọn (NVIDIA GPU với CUDA sẽ nhanh hơn, nhưng CPU cũng chạy được)
- **Disk:** ~5GB cho môi trường và dependencies

---

## 📦 Bước 1: Cài Đặt Môi Trường

### Option A: Sử dụng Conda (Khuyến nghị)

**1.1. Cài đặt Miniconda (nếu chưa có):**

```bash
# Download Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh

# Install
bash Miniconda3-latest-Linux-x86_64.sh

# Reload terminal
source ~/.bashrc
```

**1.2. Tạo môi trường Python:**

```bash
# Tạo environment với Python 3.12
conda create -n poserac python=3.12 -y

# Activate environment
conda activate poserac
```

**1.3. Cài đặt dependencies:**

```bash
# Cài đặt tất cả thư viện cần thiết
pip install opencv-python mediapipe torch pandas numpy pytorch-lightning pytorch-metric-learning matplotlib pillow

# Hoặc dùng file requirements (nếu có)
# pip install -r requirements.txt
```

---

### Option B: Sử dụng venv (Python Virtual Environment)

**1.1. Cài đặt python3-venv (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install python3.12-venv python3-pip
```

**1.2. Tạo virtual environment:**

```bash
# Tạo environment
python3.12 -m venv poserac_env

# Activate environment
source poserac_env/bin/activate
```

**1.3. Cài đặt dependencies:**

```bash
pip install opencv-python mediapipe torch pandas numpy pytorch-lightning pytorch-metric-learning matplotlib pillow
```

---

## 📂 Bước 2: Chuẩn Bị Workspace

**2.1. Download hoặc copy workspace PoseRAC:**

```bash
# Giải nén hoặc clone workspace
cd /path/to/PoseRAC
```

**2.2. Cấu trúc workspace cần có:**

```
PoseRAC/
├── video_inference_streaming.py    # File chính để chạy
├── model.py                         # Model architecture
├── all_action.csv                   # Danh sách actions
├── best_weights_PoseRAC.pth        # Pre-trained weights (BẮT BUỘC)
└── ... (các file khác)
```

**⚠️ QUAN TRỌNG:** Đảm bảo có file `best_weights_PoseRAC.pth` (pre-trained model weights)

---

## 🚀 Bước 3: Chạy Inference

### Cú Pháp Cơ Bản

```bash
python video_inference_streaming.py --video <đường_dẫn_video>
```

### Ví Dụ Cụ Thể

**1. Chạy với video đơn giản (output tự động):**

```bash
python video_inference_streaming.py --video /home/user/squat.mp4
```

→ Output sẽ là: `/home/user/squat_output.mp4`

**2. Chỉ định đường dẫn output:**

```bash
python video_inference_streaming.py --video /home/user/squat.mp4 --output /home/user/result.mp4
```

**3. Bắt buộc dùng CPU (nếu không có GPU hoặc GPU gặp lỗi):**

```bash
python video_inference_streaming.py --video /home/user/squat.mp4 --cpu
```

**4. Điều chỉnh các tham số threshold:**

```bash
python video_inference_streaming.py \
    --video /home/user/squat.mp4 \
    --enter_threshold 0.8 \
    --exit_threshold 0.4 \
    --momentum 0.4
```

---

## 📋 Tất Cả Tham Số

| Tham số | Mặc định | Mô tả |
|---------|----------|-------|
| `--video` | **BẮT BUỘC** | Đường dẫn đến video input |
| `--output` | auto | Đường dẫn video output (tự động: `<input>_output.mp4`) |
| `--model` | `best_weights_PoseRAC.pth` | Đường dẫn model weights |
| `--cpu` | False | Bắt buộc dùng CPU thay vì GPU |
| `--enter_threshold` | 0.78 | Ngưỡng để vào salient pose |
| `--exit_threshold` | 0.4 | Ngưỡng để thoát salient pose |
| `--momentum` | 0.4 | Hệ số smoothing predictions |

---

## 🎬 Quy Trình Hoàn Chỉnh (Từ Đầu)

```bash
# 1. Activate environment
conda activate poserac
# hoặc: source poserac_env/bin/activate

# 2. Di chuyển vào workspace
cd /path/to/PoseRAC

# 3. Chạy inference
python video_inference_streaming.py --video /path/to/your/video.mp4

# 4. Chờ xử lý xong, output video sẽ xuất hiện cùng thư mục với input
```

---

## 📊 Output Mong Đợi

Khi chạy thành công, bạn sẽ thấy:

```
============================================================
POSERAC - STREAMING INFERENCE (RAM OPTIMIZED)
============================================================
✅ GPU: NVIDIA GeForce RTX 3050 Ti Laptop GPU
Actions: ['front_raise', 'pull_up', 'squat', ...]
Loading model: best_weights_PoseRAC.pth

============================================================
STEP 1: Extract poses (chỉ lưu landmarks, không lưu frames)
============================================================
Video: 1920x1080 @ 30fps, 300 frames
...

============================================================
STEP 3: Analyze actions
============================================================
  front_raise: 0 reps (conf: 0.001)
  pull_up: 0 reps (conf: 0.001)
  squat: 6 reps (conf: 0.529)  ⭐ WINNER
  ...

============================================================
RESULT
============================================================
Action: squat
Repetitions: 6
Output: /path/to/output.mp4
============================================================
```

**Video output sẽ có:**
- ✅ Skeleton vẽ trên người
- ✅ Biểu đồ confidence (góc trái trên)
- ✅ Số đếm real-time (góc phải trên)
- ✅ Tên động tác (góc trái dưới)
- ✅ Điểm confidence (góc trái dưới)

---

## ❗ Xử Lý Lỗi Thường Gặp

### 1. **ModuleNotFoundError: No module named 'cv2'**

```bash
pip install opencv-python
```

### 2. **ModuleNotFoundError: No module named 'mediapipe'**

```bash
pip install mediapipe
```

### 3. **ModuleNotFoundError: No module named 'torch'**

```bash
pip install torch
```

### 4. **FileNotFoundError: best_weights_PoseRAC.pth**

→ Đảm bảo file `best_weights_PoseRAC.pth` có trong thư mục workspace

### 5. **CUDA out of memory (nếu dùng GPU)**

```bash
# Bắt buộc dùng CPU
python video_inference_streaming.py --video video.mp4 --cpu
```

### 6. **Process killed / RAM hết**

→ File đã được tối ưu để tránh hết RAM. Nếu vẫn gặp vấn đề:
- Đóng các ứng dụng khác
- Dùng video có resolution thấp hơn
- Tăng RAM hệ thống

### 7. **Video quá lớn, xử lý chậm**

→ Script tự động resize video 4K xuống 720p để tăng tốc

---

## 💡 Tips & Best Practices

### 1. **Tốc độ xử lý:**
- **GPU (CUDA):** ~2-3 phút cho video 30 giây
- **CPU:** ~5-10 phút cho video 30 giây

### 2. **Chất lượng video tốt nhất:**
- Quay rõ toàn thân người
- Ánh sáng tốt
- Góc quay cố định
- Người trong khung hình rõ ràng

### 3. **Độ chính xác:**
- Model hoạt động tốt nhất với các động tác đã train
- Nếu động tác không thuộc 8 loại được hỗ trợ, kết quả có thể không chính xác

### 4. **Kiểm tra GPU:**

```bash
# Kiểm tra CUDA có sẵn không
python -c "import torch; print(torch.cuda.is_available())"

# Nếu True: có GPU, script sẽ tự động dùng
# Nếu False: chỉ có CPU
```

---

## 🔧 Testing

**Test với video mẫu:**

```bash
# Download video test (hoặc dùng video có sẵn)
python video_inference_streaming.py --video test_squat.mp4
```

**Kết quả mong đợi:**
- Script chạy không lỗi
- Output video được tạo
- Console hiển thị đúng số lần lặp lại

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra lại các bước cài đặt
2. Đảm bảo tất cả dependencies đã được cài
3. Kiểm tra file `best_weights_PoseRAC.pth` tồn tại
4. Thử chạy với `--cpu` nếu GPU gặp lỗi

---

## 📄 File Structure Chi Tiết

```
PoseRAC/
├── video_inference_streaming.py     # 🔥 FILE CHÍNH - Chạy file này
├── model.py                          # Model architecture (PoseRAC, Action_trigger)
├── all_action.csv                    # Danh sách 8 actions
├── best_weights_PoseRAC.pth         # 🔥 Pre-trained weights (BẮT BUỘC)
│
├── simple_inference_optimized.py    # (Optional) Inference không tạo video
├── README.md                         # Hướng dẫn gốc của tác giả
├── SETUP_GUIDE.md                   # 🔥 File này - Hướng dẫn setup
│
└── utils/                            # Các utilities khác
    └── ...
```

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Tạo environment
conda create -n poserac python=3.12 -y
conda activate poserac

# 2. Cài dependencies
pip install opencv-python mediapipe torch pandas numpy pytorch-lightning pytorch-metric-learning matplotlib pillow

# 3. Di chuyển vào workspace
cd /path/to/PoseRAC

# 4. Chạy (thay YOUR_VIDEO.mp4 bằng video của bạn)
python video_inference_streaming.py --video YOUR_VIDEO.mp4

# 5. Đợi xong, xem video output!
```

---

## 📝 Example Commands

```bash
# Ví dụ 1: Video squat
python video_inference_streaming.py --video /home/user/Downloads/squat.mp4

# Ví dụ 2: Video push-up với output tùy chỉnh
python video_inference_streaming.py --video pushup.mp4 --output result_pushup.mp4

# Ví dụ 3: Dùng CPU
python video_inference_streaming.py --video jump_jack.mp4 --cpu

# Ví dụ 4: Điều chỉnh threshold cho action khó
python video_inference_streaming.py --video pullup.mp4 --enter_threshold 0.7 --exit_threshold 0.3
```

---

## ✅ Checklist Trước Khi Gửi Cho Bạn

- [ ] File `video_inference_streaming.py` có trong workspace
- [ ] File `model.py` có trong workspace
- [ ] File `all_action.csv` có trong workspace
- [ ] File `best_weights_PoseRAC.pth` có trong workspace (quan trọng!)
- [ ] File `SETUP_GUIDE.md` này có trong workspace
- [ ] Test chạy thành công ít nhất 1 lần

---

**Phiên bản:** 1.0  
**Ngày cập nhật:** November 7, 2025  
**Tác giả hướng dẫn:** AI Assistant  
**Model gốc:** PoseRAC (Yao et al., 2023)
