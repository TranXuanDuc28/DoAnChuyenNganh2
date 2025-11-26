# 📹 HƯỚNG DẪN SỬ DỤNG CAMERA REAL-TIME INFERENCE

## File: `camera_realtime_inference.py`

File này cho phép bạn **nhận diện và đếm động tác real-time qua camera** (webcam)!

## 🚀 Cách sử dụng cơ bản

### Chạy với camera mặc định (camera 0):

```bash
python camera_realtime_inference.py
```

### Chỉ định camera khác:

```bash
python camera_realtime_inference.py --camera 1
```

### Chọn action cụ thể để theo dõi:

```bash
python camera_realtime_inference.py --action squat
```

### Tự động detect action tốt nhất:

```bash
python camera_realtime_inference.py --auto_detect
```

## 🎮 Điều khiển trong khi chạy

Khi chương trình đang chạy, bạn có thể sử dụng các phím sau:

| Phím | Chức năng |
|------|-----------|
| **`q`** | Thoát chương trình |
| **`r`** | Reset counter về 0 |
| **`a`** | Hiển thị/ẩn tất cả actions và confidence scores |
| **`s`** | Chọn action cụ thể để theo dõi |

## 📋 Các tham số tùy chỉnh

```bash
python camera_realtime_inference.py \
    --camera 0 \
    --model best_weights_PoseRAC.pth \
    --csv all_action.csv \
    --action squat \
    --enter_threshold 0.78 \
    --exit_threshold 0.4 \
    --momentum 0.4 \
    --auto_detect \
    --detect_window 30
```

### Giải thích tham số:

- `--camera`: Index của camera (mặc định: 0)
- `--model`: Đường dẫn đến model weights (mặc định: `best_weights_PoseRAC.pth`)
- `--csv`: Đường dẫn đến file CSV chứa action labels (mặc định: `all_action.csv`)
- `--action`: Action cụ thể để theo dõi (nếu không chỉ định sẽ tự động detect)
- `--enter_threshold`: Ngưỡng để vào salient pose (mặc định: 0.78)
- `--exit_threshold`: Ngưỡng để thoát salient pose (mặc định: 0.4)
- `--momentum`: Hệ số smooth predictions (mặc định: 0.4)
- `--auto_detect`: Tự động detect action tốt nhất
- `--detect_window`: Số frame để tính toán action tốt nhất (mặc định: 30)

## 🎯 Các động tác được hỗ trợ

- `front_raise` - Nâng tạ trước
- `pull_up` - Kéo xà
- `squat` - Squat (gập đùi)
- `bench_pressing` - Đẩy tạ
- `jump_jack` - Bật nhảy
- `situp` - Gập bụng
- `push_up` - Chống đẩy
- `pommelhorse` - Ngựa yên

## 📺 Giao diện hiển thị

Khi chạy, bạn sẽ thấy:

1. **Skeleton** - Đường nối các điểm pose trên người (màu xanh lá và đỏ)
2. **Action name** - Tên động tác đang được theo dõi
3. **Count** - Số lần lặp lại động tác (màu xanh lá, cỡ chữ lớn)
4. **Confidence** - Độ tin cậy của prediction (màu xanh lá nếu > 0.5, cam nếu < 0.5)
5. **Best action** - Action tốt nhất nếu khác với action hiện tại (nếu bật auto-detect)

## 💡 Các chế độ sử dụng

### 1. Chế độ tự động (Auto-detect)

```bash
python camera_realtime_inference.py --auto_detect
```

- Tự động phát hiện action tốt nhất dựa trên confidence scores
- Phù hợp khi bạn muốn hệ thống tự nhận diện động tác

### 2. Chế độ chọn action cụ thể

```bash
python camera_realtime_inference.py --action squat
```

- Chỉ theo dõi một action cụ thể
- Phù hợp khi bạn biết chắc mình sẽ làm động tác gì

### 3. Chế độ xem tất cả actions

- Nhấn phím `a` trong khi chạy để xem confidence của tất cả actions
- Hữu ích để debug hoặc xem action nào có confidence cao nhất

## ⚙️ Yêu cầu hệ thống

- **Camera**: Webcam hoặc camera USB
- **Python**: 3.8+
- **Dependencies**: Xem `requirements.txt` hoặc `requirements_inference.txt`
- **Model**: File `best_weights_PoseRAC.pth` (đã có sẵn)
- **Labels**: File `all_action.csv` (đã có sẵn)

## 🔧 Troubleshooting

### Camera không mở được

```bash
# Thử camera khác
python camera_realtime_inference.py --camera 1

# Hoặc kiểm tra camera có hoạt động không
python -c "import cv2; cap = cv2.VideoCapture(0); print('Camera OK' if cap.isOpened() else 'Camera Error')"
```

### Không detect được pose

- Đảm bảo ánh sáng đủ
- Đứng đủ xa camera để nhìn thấy toàn thân
- Tránh background phức tạp
- Đảm bảo camera không bị che khuất

### Counter không đếm chính xác

- Thử điều chỉnh `--enter_threshold` và `--exit_threshold`
- Đảm bảo động tác được thực hiện đầy đủ và rõ ràng
- Reset counter bằng phím `r` nếu cần

### FPS thấp / Lag

- Đóng các ứng dụng khác đang sử dụng camera
- Giảm độ phân giải camera (script tự động set 640x480)
- Sử dụng GPU nếu có: script tự động detect CUDA

## 📊 Performance

- **FPS**: ~15-30 FPS (tùy thuộc vào CPU/GPU)
- **Latency**: ~50-100ms per frame
- **RAM**: ~500MB-1GB

## 🎓 Tips để có kết quả tốt nhất

1. **Ánh sáng**: Đảm bảo đủ ánh sáng, tránh ngược sáng
2. **Khoảng cách**: Đứng cách camera 2-3 mét
3. **Góc quay**: Camera nên quay từ phía trước hoặc góc 45 độ
4. **Background**: Background đơn giản, tương phản với người
5. **Quần áo**: Mặc quần áo tương phản với background
6. **Động tác**: Thực hiện động tác đầy đủ và rõ ràng

## 🔄 So sánh với các file khác

| Feature | `simple_inference.py` | `camera_realtime_inference.py` |
|---------|----------------------|-------------------------------|
| Input | Video file | **Camera real-time** ✅ |
| Output | Console text | **Live video + counter** ✅ |
| Tốc độ | Sau khi video kết thúc | **Real-time** ✅ |
| Use case | Phân tích video đã quay | **Theo dõi real-time** ✅ |

## 📝 Ví dụ sử dụng

### Ví dụ 1: Tập squat và đếm

```bash
python camera_realtime_inference.py --action squat
```

- Đứng trước camera
- Thực hiện động tác squat
- Xem counter tăng lên mỗi lần squat

### Ví dụ 2: Tự động nhận diện động tác

```bash
python camera_realtime_inference.py --auto_detect
```

- Hệ thống tự động phát hiện bạn đang làm động tác gì
- Counter tự động đếm cho động tác đó

### Ví dụ 3: Xem tất cả actions

```bash
python camera_realtime_inference.py
# Nhấn phím 'a' trong khi chạy
```

- Xem confidence của tất cả 8 actions
- Hữu ích để debug hoặc hiểu model đang nghĩ gì

## 🎉 Enjoy!

Chúc bạn sử dụng thành công! Nếu có vấn đề, hãy kiểm tra:
1. Camera có hoạt động không
2. Dependencies đã cài đầy đủ chưa
3. Model weights file có tồn tại không

