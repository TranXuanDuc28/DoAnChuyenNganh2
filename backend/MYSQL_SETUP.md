# Hướng dẫn cài đặt MySQL cho Fitness App

## 1. Cài đặt MySQL

### Trên Windows:
1. Tải MySQL Community Server từ: https://dev.mysql.com/downloads/mysql/
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ password root mà bạn đặt

### Trên macOS:
```bash
# Sử dụng Homebrew
brew install mysql
brew services start mysql
```

### Trên Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

## 2. Cấu hình MySQL

### Tạo database và user:
```sql
-- Đăng nhập vào MySQL
mysql -u root -p

-- Tạo database
CREATE DATABASE fitness_app;

-- Tạo user mới (tùy chọn)
CREATE USER 'fitness_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fitness_app.* TO 'fitness_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fitness_app
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
```

## 4. Cài đặt Dependencies

```bash
cd backend
npm install
```

## 5. Chạy Migration

### Cách 1: Sử dụng SQL file
```bash
# Chạy migration SQL
mysql -u root -p fitness_app < migrations/001_create_database.sql
```

### Cách 2: Sử dụng Sequelize sync (tự động)
```bash
# Sequelize sẽ tự động tạo tables khi chạy server
npm run dev
```

## 6. Kiểm tra kết nối

```bash
# Chạy server
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
MySQL database connected successfully
Database synchronized successfully
Server running on port 5000
```

## 7. Seed Data (Tùy chọn)

```bash
# Chạy với seed data
npm run seed
```

## 8. Troubleshooting

### Lỗi kết nối MySQL:
- Kiểm tra MySQL service đang chạy
- Kiểm tra username/password trong .env
- Kiểm tra port MySQL (mặc định 3306)

### Lỗi permission:
```sql
-- Cấp quyền cho user
GRANT ALL PRIVILEGES ON fitness_app.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Lỗi charset:
```sql
-- Đặt charset UTF8
ALTER DATABASE fitness_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 9. Cấu trúc Database

Database sẽ có các bảng chính:
- `users` - Thông tin người dùng
- `exercises` - Bài tập
- `workouts` - Chương trình tập
- `workout_sessions` - Phiên tập
- `foods` - Thực phẩm
- `meals` - Bữa ăn
- `nutrition_entries` - Nhật ký dinh dưỡng
- `sleep_records` - Nhật ký giấc ngủ
- `heart_rate_records` - Nhật ký nhịp tim
- Và nhiều bảng khác...

## 10. Backup và Restore

### Backup:
```bash
mysqldump -u root -p fitness_app > backup.sql
```

### Restore:
```bash
mysql -u root -p fitness_app < backup.sql
```

