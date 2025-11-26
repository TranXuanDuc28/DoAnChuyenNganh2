# Backend - Pose Recognition (Node.js + MySQL)

## Yêu cầu
- Node.js >= 18
- MySQL >= 8 (hoặc 5.7)
- Windows cần build tools khi cài `@tensorflow/tfjs-node` (Visual Studio Build Tools, Python 3.8+). Nếu gặp lỗi, dùng WSL hoặc Docker.

## Cấu hình
Tạo file `.env` trong thư mục `backend`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=fitness_app
NODE_ENV=development
```

## Cài đặt
```
cd backend
npm i
```

Lưu ý: gói `@tensorflow/tfjs-node` có thể mất vài phút để cài đặt.

## Chạy server
```
npm run dev
```
Server mặc định chạy tại `http://localhost:5000`.

## Database
Sequelize sẽ tự động `sync` schema. Bảng mới:
- `pose_logs` – lưu mỗi lần đánh giá tư thế

## API
- POST `/api/pose/evaluate`
  - body: `{ user_id?, exerciseName: 'squat'|'plank', imageBase64? , keypoints? }`
  - trả về: `{ success, isCorrect, score, angles, logId }`
- GET `/api/pose/history?user_id=&limit=`
  - trả về: `{ success, items }`

## Mô hình nhận diện
- Server dùng MoveNet (pose-detection) qua `@tensorflow/tfjs-node`.
- Nếu gửi `keypoints` từ client thì server bỏ qua bước detect và chỉ đánh giá/gán điểm.

## Troubleshooting

### Lỗi: "Pose detector unavailable on server"

**Nguyên nhân:**
- `@tensorflow/tfjs-node` chưa được cài đặt hoặc không thể load
- TensorFlow backend initialization thất bại

**Giải pháp:**

1. **Cài đặt TensorFlow.js Node (khuyến nghị):**
   ```bash
   npm install @tensorflow/tfjs-node
   ```
   
   **Lưu ý trên Windows:**
   - Cần Visual Studio Build Tools (C++ build tools)
   - Cần Python 3.8+ trong PATH
   - Hoặc chạy trong WSL/Docker để tránh vấn đề build native modules

2. **Fallback: Gửi keypoints từ client (khuyến nghị cho production):**
   - Client tự detect pose bằng TensorFlow.js
   - Gửi `keypoints` array thay vì `imageBase64`
   - Server chỉ đánh giá pose, không cần TensorFlow.js
   - Nhẹ hơn và nhanh hơn cho server

3. **Sử dụng Python-based pose detection:**
   - Sử dụng `RealtimePoseRACService` hoặc `PoseRACService`
   - Yêu cầu Python script và model files

### Lỗi: Python script timeout hoặc không trả về kết quả

**Nguyên nhân:**
- Python script chạy quá lâu (>30s)
- Script crash mà không log lỗi
- Script không trả về JSON output đúng format

**Giải pháp:**

1. **Kiểm tra Python script:**
   - Đảm bảo script tồn tại tại đường dẫn đúng
   - Test script trực tiếp: `python realtime_frame_inference.py <base64> <exercise> <model> <csv>`
   - Kiểm tra script có in JSON ra stdout không

2. **Kiểm tra dependencies Python:**
   - Cài đặt đầy đủ packages: `pip install -r requirements.txt`
   - Kiểm tra model file và CSV file tồn tại

3. **Xem logs chi tiết:**
   - Server logs sẽ hiển thị stdout/stderr từ Python script
   - Kiểm tra console output để debug

### Lỗi cài `tfjs-node` trên Windows
- Cài Visual Studio Build Tools, Python, hoặc chạy trong WSL/Docker.

### RAM/CPU cao khi detect ảnh
- Gửi `keypoints` từ client sẽ nhẹ hơn nhiều cho server.
