# Admin Web Panel - Fitness App

Trang web quản trị viên cho ứng dụng Fitness App.

## Tính năng

- ✅ **Quản lý người dùng**: Xem, thêm, sửa, xóa người dùng. Kích hoạt/vô hiệu hóa tài khoản.
- ✅ **Quản lý nội dung**:
  - Bài tập (Exercises): Quản lý tất cả bài tập trong hệ thống
  - Workouts: Quản lý các chương trình tập
  - Kế hoạch tập (Workout Plans): Xem và quản lý kế hoạch tập của người dùng
- ✅ **Cài đặt hệ thống**: Tùy chỉnh giao diện và cấu hình hệ thống
- ✅ **Dashboard**: Tổng quan thống kê hệ thống

## Cài đặt

```bash
cd admin-web
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3001`

## Cấu hình

Tạo file `.env` trong thư mục `admin-web/`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Đăng nhập

Để đăng nhập, bạn cần có tài khoản với role `admin`. 

### Tạo tài khoản Admin

Có 3 cách để tạo tài khoản admin:

#### 1. Qua API (Tạo admin đầu tiên - Không cần authentication)

Endpoint này chỉ hoạt động khi chưa có admin nào trong hệ thống:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Hoặc sử dụng Postman/Thunder Client:
- **URL**: `POST http://localhost:5000/api/auth/create-admin`
- **Body** (JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

#### 2. Qua API với Secret Key (An toàn hơn)

Thêm vào file `.env` của backend:
```env
ADMIN_SECRET_KEY=your-secret-key-here
```

Sau đó gọi API:
```bash
curl -X POST http://localhost:5000/api/auth/create-admin-secure \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "secretKey": "your-secret-key-here"
  }'
```

#### 3. Qua Script (Command Line)

```bash
cd backend
node scripts/create-admin.js admin@example.com admin123 Admin User
```

#### 4. Qua Admin Panel (Nếu đã có admin khác)

Nếu đã có admin, bạn có thể đăng nhập vào admin panel và tạo admin mới qua trang Users.

#### 5. Qua Database (SQL)

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Cấu trúc dự án

```
admin-web/
├── src/
│   ├── components/      # Components dùng chung
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── pages/           # Các trang
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Exercises.jsx
│   │   ├── Workouts.jsx
│   │   ├── WorkoutPlans.jsx
│   │   └── Settings.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## API Endpoints

Tất cả API endpoints được định nghĩa trong `src/services/api.js`:

- `/api/admin/stats` - Thống kê hệ thống
- `/api/admin/users` - Quản lý người dùng
- `/api/admin/exercises` - Quản lý bài tập
- `/api/admin/workouts` - Quản lý workouts
- `/api/admin/workout-plans` - Quản lý kế hoạch tập
- `/api/admin/settings` - Cài đặt hệ thống

## Build cho production

```bash
npm run build
```

Files sẽ được build vào thư mục `dist/`

