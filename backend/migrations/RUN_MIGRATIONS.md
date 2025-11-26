# Hướng dẫn chạy Migration

## Vấn đề
Database hiện tại đang dùng **camelCase** cho tên cột (`englishName`, `imageUrl`, etc.), nhưng Sequelize config có `underscored: true`, nên nó mong đợi **snake_case** (`english_name`, `image_url`, etc.).

## Giải pháp
Chạy migration để đổi tên các cột từ camelCase sang snake_case.

## Cách chạy

### Cách 1: Dùng MySQL Command Line
```bash
cd backend
mysql -u root -p fitness_app < migrations/004_fix_exercise_categories_columns.sql
```

### Cách 2: Dùng MySQL Workbench hoặc phpMyAdmin
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Chọn database `fitness_app`
3. Mở file `migrations/004_fix_exercise_categories_columns.sql`
4. Copy toàn bộ nội dung và chạy

### Cách 3: Chạy từ Node.js
```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Điền password của bạn
    database: 'fitness_app',
    multipleStatements: true
  });
  
  const sql = fs.readFileSync('migrations/004_fix_exercise_categories_columns.sql', 'utf8');
  await connection.query(sql);
  console.log('Migration completed successfully!');
  await connection.end();
})();
"
```

## Kiểm tra sau khi chạy

Chạy query sau để kiểm tra:
```sql
DESCRIBE exercise_categories;
```

Bạn sẽ thấy các cột:
- ✅ `english_name` (không phải `englishName`)
- ✅ `image_url` (không phải `imageUrl`)
- ✅ `image_key` (không phải `imageKey`)
- ✅ `background_color` (không phải `backgroundColor`)
- ✅ `display_order` (không phải `displayOrder`)
- ✅ `is_active` (không phải `isActive`)

## Lưu ý
- Migration này an toàn, nó chỉ đổi tên cột, không mất dữ liệu
- Nếu cột đã ở dạng snake_case rồi, migration sẽ bỏ qua
- Sau khi chạy migration, khởi động lại backend server

