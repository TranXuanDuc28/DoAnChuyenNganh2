# 🏋️ PoseRAC - Pose-based Repetitive Action Counting

Nhận diện và đếm số lần lặp lại động tác thể dục từ video bằng AI.

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-red)](https://pytorch.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Chức Năng

**Input:** 1 video chứa động tác thể dục

**Output:** 
- ✅ Video có visualization (skeleton + graph + counter)
- ✅ Số lần lặp lại động tác
- ✅ Loại động tác được nhận diện

**8 Động Tác Được Hỗ Trợ:**
- `front_raise` - Nâng tạ trước
- `pull_up` - Kéo xà
- `squat` - Squat (gập đùi)
- `bench_pressing` - Đẩy tạ
- `jump_jack` - Bật nhảy
- `situp` - Gập bụng
- `push_up` - Chống đẩy
- `pommelhorse` - Ngựa yên

---

## 🚀 Quick Start

### 1. Cài Đặt Môi Trường

```bash
# Tạo environment
conda create -n poserac python=3.12 -y
conda activate poserac

# Cài dependencies
pip install -r requirements_inference.txt
```

### 2. Chạy Inference

```bash
python video_inference_streaming.py --video your_video.mp4
```

**That's it!** 🎉

---

## 📖 Hướng Dẫn Chi Tiết

- 📘 **[QUICKSTART.md](QUICKSTART.md)** - Bắt đầu nhanh trong 4 bước
- 📗 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Hướng dẫn chi tiết đầy đủ
- 📙 **[FILES_OVERVIEW.md](FILES_OVERVIEW.md)** - Tổng quan các files

---

## 🎬 Demo

**Input Video:**
```
squat.mp4 (30 giây, 6 lần squat)
```

**Output:**
```
Action: squat
Repetitions: 6
Confidence: 0.529
Output: squat_output.mp4
```

**Video Output Visualization:**
- Skeleton vẽ trên người
- Biểu đồ confidence theo thời gian
- Counter đếm số lần real-time
- Tên động tác + confidence score

---

## 💻 System Requirements

- **OS:** Linux (Ubuntu/Debian) hoặc Windows với WSL
- **Python:** 3.8 - 3.12
- **RAM:** 8GB+ (khuyến nghị 16GB)
- **GPU:** Tùy chọn (NVIDIA GPU nhanh hơn, nhưng CPU cũng chạy được)

---

## 📋 Command Line Usage

```bash
# Cơ bản
python video_inference_streaming.py --video video.mp4

# Chỉ định output
python video_inference_streaming.py --video video.mp4 --output result.mp4

# Dùng CPU
python video_inference_streaming.py --video video.mp4 --cpu

# Điều chỉnh threshold
python video_inference_streaming.py --video video.mp4 --enter_threshold 0.8
```

**Tham số:**
- `--video` - Video input (BẮT BUỘC)
- `--output` - Video output (mặc định: auto)
- `--cpu` - Bắt buộc dùng CPU
- `--model` - Model weights path
- `--enter_threshold` - Ngưỡng vào pose (0.78)
- `--exit_threshold` - Ngưỡng thoát pose (0.4)
- `--momentum` - Momentum smoothing (0.4)

---

## 📁 Files Quan Trọng

| File | Mô tả |
|------|-------|
| `video_inference_streaming.py` | **File chính** - Chạy file này |
| `model.py` | Model architecture |
| `all_action.csv` | Danh sách actions |
| `best_weights_PoseRAC.pth` | Pre-trained weights |

⚠️ File `best_weights_PoseRAC.pth` là **BẮT BUỘC**!

---

## 🔧 Troubleshooting

### Lỗi thiếu thư viện
```bash
pip install opencv-python mediapipe torch pandas numpy
```

### Không có GPU / CUDA error
```bash
python video_inference_streaming.py --video video.mp4 --cpu
```

### Process bị kill / Out of memory
→ Script đã tối ưu streaming, tránh hết RAM

### Video output không có skeleton
→ Đảm bảo trong video nhìn rõ toàn thân người

---

## 📊 Performance

| Cấu hình | Tốc độ | Video 30s |
|----------|--------|-----------|
| GPU (RTX 3050 Ti) | ~3-4 phút | ✅ |
| CPU (Intel i7) | ~8-10 phút | ✅ |

---

## 🎓 Citation

```bibtex
@article{yao2023poserac,
  title={PoseRAC: Pose Saliency Transformer for Repetitive Action Counting},
  author={Yao, Ziyu and Cheng, Xuxin and Zou, Yuexian},
  journal={arXiv preprint arXiv:2303.08450},
  year={2023}
}
```

---

## 📄 License

MIT License - Xem file [LICENSE](LICENSE)

---

## 🤝 Contributing

Workspace này được tối ưu cho inference. Nếu muốn train lại model, xem file gốc `README.md`.

---

## 📞 Support

Gặp vấn đề? Xem:
1. [QUICKSTART.md](QUICKSTART.md) - Hướng dẫn nhanh
2. [SETUP_GUIDE.md](SETUP_GUIDE.md) - Hướng dẫn chi tiết
3. Chạy `check_environment.sh` để kiểm tra môi trường

---

## ⭐ Features

- ✅ Inference chỉ với 1 dòng lệnh
- ✅ Tự động nhận diện loại động tác
- ✅ Đếm số lần lặp lại chính xác
- ✅ Tạo video output với visualization
- ✅ Hỗ trợ GPU và CPU
- ✅ Tối ưu RAM (streaming processing)
- ✅ Tự động resize video lớn
- ✅ Pre-trained model sẵn sàng

---

**Version:** 1.0 (Optimized for Inference)  
**Last Updated:** November 7, 2025  
**Based on:** PoseRAC (Yao et al., 2023)
