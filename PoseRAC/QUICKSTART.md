# 🚀 QUICK START - PoseRAC

## Chỉ Cần 4 Bước!

### 1️⃣ Tạo Môi Trường Python

```bash
# Với Conda (khuyến nghị)
conda create -n poserac python=3.12 -y
conda activate poserac

# HOẶC với venv
python3.12 -m venv poserac_env
source poserac_env/bin/activate
```

### 2️⃣ Cài Đặt Thư Viện

```bash
pip install opencv-python mediapipe torch pandas numpy pytorch-lightning pytorch-metric-learning matplotlib pillow
```

Hoặc dùng file requirements:
```bash
pip install -r requirements_inference.txt
```

### 3️⃣ Kiểm Tra Môi Trường (Optional)

```bash
chmod +x check_environment.sh
./check_environment.sh
```

### 4️⃣ Chạy Inference!

```bash
python video_inference_streaming.py --video YOUR_VIDEO.mp4
```

---

## 📝 Ví Dụ Cụ Thể

```bash
# Ví dụ 1: Video squat
python video_inference_streaming.py --video squat.mp4

# Ví dụ 2: Chỉ định output
python video_inference_streaming.py --video pushup.mp4 --output result.mp4

# Ví dụ 3: Dùng CPU (không có GPU)
python video_inference_streaming.py --video video.mp4 --cpu
```

---

## ✅ Yêu Cầu Files

Đảm bảo có các file sau trong workspace:

- ✅ `video_inference_streaming.py` - File chính
- ✅ `model.py` - Model
- ✅ `all_action.csv` - Danh sách actions
- ✅ `best_weights_PoseRAC.pth` - **BẮT BUỘC** (pre-trained weights)

---

## 📊 Kết Quả

**Input:** Video chứa động tác (squat, push-up, pull-up, v.v.)

**Output:** 
- Video có skeleton + graph + counter
- Số lần lặp lại động tác
- Loại động tác được nhận diện

**8 Động Tác Được Hỗ Trợ:**
1. front_raise
2. pull_up
3. squat
4. bench_pressing
5. jump_jack
6. situp
7. push_up
8. pommelhorse

---

## ❓ Gặp Lỗi?

Xem file `SETUP_GUIDE.md` để biết chi tiết và cách xử lý lỗi.

---

**That's it! 🎉**
