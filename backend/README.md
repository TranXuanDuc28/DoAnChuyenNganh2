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
  - body: `{ userId?, exerciseName: 'squat'|'plank', imageBase64? , keypoints? }`
  - trả về: `{ success, isCorrect, score, angles, logId }`
- GET `/api/pose/history?userId=&limit=`
  - trả về: `{ success, items }`

## Mô hình nhận diện
- Server dùng MoveNet (pose-detection) qua `@tensorflow/tfjs-node`.
- Nếu gửi `keypoints` từ client thì server bỏ qua bước detect và chỉ đánh giá/gán điểm.

## Troubleshooting
- Lỗi cài `tfjs-node` trên Windows: cài Visual Studio Build Tools, Python, hoặc chạy trong WSL/Docker.
- RAM/CPU cao khi detect ảnh: gửi `keypoints` từ client sẽ nhẹ hơn nhiều.
