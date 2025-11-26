# 📁 DANH SÁCH FILES QUAN TRỌNG

## 🔥 Files BẮT BUỘC (để chạy inference)

| File | Mô tả | Kích thước |
|------|-------|------------|
| `video_inference_streaming.py` | **File chính để chạy** - Inference với video output | ~15KB |
| `model.py` | Model architecture (PoseRAC + Action_trigger) | ~5KB |
| `all_action.csv` | Danh sách 8 loại động tác | ~1KB |
| `best_weights_PoseRAC.pth` | **Pre-trained model weights** | ~1.5MB |

⚠️ **QUAN TRỌNG:** Không thể thiếu file `best_weights_PoseRAC.pth`!

---

## 📖 Files Hướng Dẫn

| File | Mô tả |
|------|-------|
| `QUICKSTART.md` | **Bắt đầu nhanh** - 4 bước setup và chạy |
| `SETUP_GUIDE.md` | **Hướng dẫn chi tiết** - Đầy đủ mọi thông tin |
| `requirements_inference.txt` | Danh sách thư viện cần cài |
| `check_environment.sh` | Script kiểm tra môi trường |
| `FILES_OVERVIEW.md` | File này - Tổng quan các files |

---

## 🔧 Files Tùy Chọn (không bắt buộc)

| File | Mô tả |
|------|-------|
| `simple_inference_optimized.py` | Inference đơn giản (không tạo video output) |
| `train.py` | Train model (nếu muốn train lại) |
| `eval.py` | Evaluate model trên test set |
| `pre_train.py` | Preprocessing cho training |
| `pre_test.py` | Preprocessing cho testing |

---

## 📂 Cấu Trúc Workspace Tối Thiểu

Để chạy được inference, workspace CẦN có:

```
PoseRAC/
├── video_inference_streaming.py    ← File chính
├── model.py                         ← Model
├── all_action.csv                   ← Actions list
├── best_weights_PoseRAC.pth        ← Weights (BẮT BUỘC!)
│
├── QUICKSTART.md                    ← Bắt đầu nhanh
├── SETUP_GUIDE.md                   ← Hướng dẫn chi tiết
├── requirements_inference.txt       ← Dependencies
└── check_environment.sh             ← Kiểm tra môi trường
```

---

## 📤 Gửi Cho Bạn

**Tối thiểu cần gửi:**
1. ✅ `video_inference_streaming.py`
2. ✅ `model.py`
3. ✅ `all_action.csv`
4. ✅ `best_weights_PoseRAC.pth`
5. ✅ `QUICKSTART.md` hoặc `SETUP_GUIDE.md`
6. ✅ `requirements_inference.txt`

**Tổng dung lượng:** ~2MB (chủ yếu là weights file)

---

## 🎯 Workflow

```
1. Đọc QUICKSTART.md
   ↓
2. Setup môi trường (conda/venv)
   ↓
3. Cài dependencies (pip install)
   ↓
4. Chạy check_environment.sh (optional)
   ↓
5. Chạy: python video_inference_streaming.py --video VIDEO.mp4
   ↓
6. Nhận output video với visualization!
```

---

## 💡 Lưu Ý

- Nếu gửi qua email/cloud, nén thành `.zip` hoặc `.tar.gz`
- File `best_weights_PoseRAC.pth` là file lớn nhất (~1.5MB)
- Bạn của bạn chỉ cần chạy 1 lệnh: `python video_inference_streaming.py --video VIDEO.mp4`
- Không cần train lại model, chỉ cần inference

---

**Prepared by:** AI Assistant  
**Date:** November 7, 2025
