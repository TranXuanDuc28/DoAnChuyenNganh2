# HƯỚNG DẪN SỬ DỤNG SIMPLE INFERENCE

## File: `simple_inference.py`

File này giúp bạn **inference video đơn giản** - chỉ cần đưa vào đường dẫn video!

## Cách sử dụng cơ bản

### Chỉ cần 1 lệnh:

```bash
python simple_inference.py --video /path/to/your/video.mp4
```

### Ví dụ cụ thể:

```bash
# Nếu bạn có video squat.mp4
python simple_inference.py --video squat.mp4

# Hoặc với đường dẫn đầy đủ
python simple_inference.py --video /home/user/Videos/my_squat_video.mp4
```

## Output bạn sẽ nhận được:

```
==============================================================
POSERAC - SIMPLE INFERENCE
==============================================================
Các loại động tác có thể nhận diện: ['front_raise', 'pull_up', 'squat', 'bench_pressing', 'jump_jack', 'situp', 'push_up', 'pommelhorse']

Đang extract poses từ video: squat.mp4
Processed 150 frames...
Đã extract 150 frames

Đang load model từ: best_weights_PoseRAC.pth
Đang inference...

Đang phân tích từng loại động tác...
  front_raise: 2 lần lặp lại
  pull_up: 3 lần lặp lại
  squat: 12 lần lặp lại
  bench_pressing: 1 lần lặp lại
  jump_jack: 5 lần lặp lại
  situp: 4 lần lặp lại
  push_up: 2 lần lặp lại
  pommelhorse: 0 lần lặp lại

==============================================================
KẾT QUẢ INFERENCE
==============================================================
Loại động tác: squat
Số lần lặp lại: 12
==============================================================
```

## Các tham số tùy chỉnh (Optional):

```bash
python simple_inference.py \
    --video your_video.mp4 \
    --model best_weights_PoseRAC.pth \
    --enter_threshold 0.78 \
    --exit_threshold 0.4 \
    --momentum 0.4
```

### Giải thích tham số:

- `--video`: **(BẮT BUỘC)** Đường dẫn đến video input
- `--model`: Model weights (mặc định: `best_weights_PoseRAC.pth`)
- `--enter_threshold`: Ngưỡng để vào salient pose (mặc định: 0.78)
- `--exit_threshold`: Ngưỡng để thoát salient pose (mặc định: 0.4)
- `--momentum`: Hệ số smooth predictions (mặc định: 0.4)

## Những gì script này làm:

1. ✅ **Extract poses** từ video tự động (dùng MediaPipe)
2. ✅ **Normalize** landmarks
3. ✅ **Load model** pre-trained (`best_weights_PoseRAC.pth`)
4. ✅ **Inference** và phân loại động tác
5. ✅ **Đếm số lần lặp lại** của động tác
6. ✅ **Trả về kết quả** rõ ràng

## Yêu cầu:

- Model weights: `best_weights_PoseRAC.pth` (đã có sẵn)
- File labels: `all_action.csv` (đã có sẵn)
- Dependencies: xem `requirements.txt`

## So sánh với file cũ:

| Feature | `inference_and_visualization.py` | `simple_inference.py` (MỚI) |
|---------|----------------------------------|----------------------------|
| Input cần | Video + test.csv + poses đã extract | **Chỉ cần video** ✅ |
| Output | Video visualization | Số đếm + loại động tác |
| Phức tạp | Cao | **Đơn giản** ✅ |
| Tốc độ | Chậm hơn (render video) | Nhanh hơn |

## Lưu ý:

- Model chỉ nhận diện được **8 loại động tác** đã được train
- Nếu video có động tác khác, model sẽ cố gắng map vào 1 trong 8 loại (có thể không chính xác)
- Độ chính xác phụ thuộc vào chất lượng video và góc quay

## Troubleshooting:

**Lỗi: ModuleNotFoundError**
```bash
pip install -r requirements.txt
```

**Lỗi: File not found**
- Kiểm tra đường dẫn video có đúng không
- Kiểm tra file `best_weights_PoseRAC.pth` và `all_action.csv` có trong thư mục

**Kết quả không chính xác**
- Thử điều chỉnh `enter_threshold` và `exit_threshold`
- Đảm bảo video quay rõ người và góc phù hợp
