Remove-Item -Recurse -Force android, ios, node_modules
"@mediapipe/pose": "^0.5.1675469404",     
"@tensorflow-models/pose-detection": "^2.1.3",
"@tensorflow/tfjs": "^4.22.0",
"@tensorflow/tfjs-backend-webgpu": "^4.22.0",
"@tensorflow/tfjs-react-native": "^1.0.0",

npx install-expo-modules@latest
npx expo run:android

eas build --platform android --profile development
# React Native
Template này được sử dụng cho video hướng dẫn React Native (basic) của tác giả Hỏi Dân IT (Eric)

### Môi trường chạy dự án: Node.js v20.14.0
https://nodejs.org/download/release/v20.14.0/

## Về tác giả
Mọi thông tin về Tác giả Hỏi Dân IT, các bạn có thể tìm kiếm tại đây:

Website chính thức: https://hoidanit.vn/

Youtube “Hỏi Dân IT” : https://www.youtube.com/@hoidanit

Tiktok “Hỏi Dân IT” :  https://www.tiktok.com/@hoidanit

Fanpage “Hỏi Dân IT” : https://www.facebook.com/askITwithERIC/

Udemy Hỏi Dân IT: https://www.udemy.com/user/eric-7039/

===

Các bước cài đặt: (chế độ development)
1. clone code
2. cài đặt thư viện: npm i
3. Update file .env (nếu cần thiết)
4. Chạy dự án:  npm start | hoặc | npm run dev 

## Nhận diện tư thế (Pose)

- Mở tab `Pose` trong app.
- Nhấn "Đánh giá tư thế" để chụp hình và gửi lên server.
- Server sẽ trả về điểm số và đánh giá đúng/sai theo bài tập (mặc định: squat).

Lưu ý phát triển:
- Nếu chạy Android emulator: API base URL tự động dùng `10.0.2.2` (được cấu hình trong `services/api.js`).
- Máy thật cần đặt biến môi trường `REACT_NATIVE_API_HOST` bằng IP máy chạy backend, hoặc sửa trực tiếp trong `services/api.js`.