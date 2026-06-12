# 🔄 Các luồng nghiệp vụ chi tiết (System Workflows)

Tài liệu này mô tả chi tiết các luồng nghiệp vụ và luồng dữ liệu (Data & Logic flows) trong **Hệ thống hỗ trợ tập luyện AI (AI Fitness Training App)**. Các sơ đồ tuần tự (Sequence Diagram) dưới đây thể hiện sự tương tác giữa Mobile App, Admin Web, Backend API (Node.js/Express/Socket.IO), cơ sở dữ liệu MySQL và các dịch vụ AI/ML (Python, Mediapipe, PoseRAC, Gemini AI).

---

## 👥 I. Nhóm Người dùng (User Workflows)

### 1. Đăng ký & Đăng nhập (Authentication & Authorization)
Mô tả quy trình đăng ký tài khoản mới và đăng nhập nhận mã thông báo JWT để phân quyền truy cập hệ thống giữa Client (Mobile/Web) và Backend.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant Client as "Mobile App / Admin Web"
    participant Backend as "Node.js Backend"
    participant DB as "MySQL Database"

    %% Đăng ký tài khoản
    Note over User, DB: Quy trình Đăng ký (Register)
    User->>Client: Nhập thông tin đăng ký (Email, Password, Name,...)
    Client->>Backend: Gửi POST /api/auth/register (JSON)
    Backend->>DB: Kiểm tra trùng lặp Email
    alt Email đã tồn tại
        DB-->>Backend: Đã tồn tại
        Backend-->>Client: Trả về lỗi 400 (Email already exists)
        Client-->>User: Hiển thị thông báo email đã tồn tại
    else Email hợp lệ
        Backend->>Backend: Mã hóa mật khẩu (Bcrypt hashing)
        Backend->>DB: Lưu thông tin User mới
        DB-->>Backend: Thành công (Lưu bản ghi)
        Backend-->>Client: Trả về đăng ký thành công (201 Created)
        Client-->>User: Chuyển hướng sang màn hình Đăng nhập
    end

    %% Đăng nhập
    Note over User, DB: Quy trình Đăng nhập (Login)
    User->>Client: Nhập Email & Mật khẩu
    Client->>Backend: Gửi POST /api/auth/login (JSON)
    Backend->>DB: Truy vấn thông tin user theo Email
    DB-->>Backend: Thông tin User & Password đã hash
    Backend->>Backend: So khớp mật khẩu (Bcrypt compare)
    alt Mật khẩu không đúng
        Backend-->>Client: Trả về lỗi 400 (Invalid credentials)
        Client-->>User: Hiển thị thông báo sai thông tin đăng nhập
    else Khớp mật khẩu
        Backend->>Backend: Tạo Token JWT chứa thông tin User ID
        Backend-->>Client: Trả về JWT Token & thông tin cơ bản (200 OK)
        Client->>Client: Lưu trữ JWT an toàn (AsyncStorage / LocalStorage)
        Client-->>User: Chuyển hướng vào màn hình Dashboard chính
    end
```

---

### 2. Phân tích tư thế tĩnh qua ảnh (Static Pose Evaluation via REST API)
Mô tả quy trình chụp ảnh/gửi ảnh từ Mobile App lên Backend để gọi dịch vụ Python phân tích tư thế Yoga tĩnh, so sánh góc khớp xương với hình mẫu và trả về đánh giá chi tiết.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant App as "Mobile App"
    participant Backend as "Node.js Backend"
    participant PyService as "Python ML Service (main_auto.py)"
    participant DB as "MySQL Database"

    User->>App: Chọn bài tập Yoga & Nhấn "Chụp ảnh" / "Tải ảnh"
    App->>App: Chuyển đổi ảnh sang Base64
    App->>Backend: Gửi POST /api/pose/evaluate-pose (JWT, imageBase64)
    Note over Backend: Lưu ảnh tạm thời<br/>./tmp/pose_in_[timestamp].jpg
    
    Backend->>PyService: Spawn tiến trình con (python main_auto.py <tempFile>)
    Note over PyService: 1. Đọc ảnh từ file tạm<br/>2. Dùng Mediapipe lấy 33 Keypoints<br/>3. Tính toán các góc khớp xương chính<br/>4. Vẽ khung xương xương (Skeleton)<br/>5. So sánh góc khớp với tư thế chuẩn (Yoga Model)<br/>6. Xuất kết quả JSON ra stdout
    PyService-->>Backend: Trả về kết quả JSON qua stdout
    
    Note over Backend: Xóa file ảnh tạm thời<br/>./tmp/pose_in_*.jpg
    Backend->>Backend: Lưu các file ảnh kết quả phân tích:<br/>- input, result, reference, comparison (vào /uploads)
    Backend->>DB: Lưu kết quả phân tích vào bảng `ImageEvaluations`
    DB-->>Backend: Đã lưu thành công
    Backend-->>App: Trả về JSON { success: true, score, isCorrect, feedback, inputImageUrl, resultImageUrl, comparisonImageUrl }
    App-->>User: Hiển thị điểm số, khung xương annotated và chỉ dẫn sửa tư thế
```

---

### 3. Phân tích tư thế thời gian thực (Real-time Pose WebSocket)
Mô tả luồng truyền trực tiếp (stream) các frame ảnh camera của người dùng qua kết nối WebSocket (Socket.IO) để nhận phản hồi phân tích khung xương và đếm số rep liên tục với độ trễ cực thấp.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant App as "Mobile App"
    participant Backend as "Node.js Backend (Socket.IO)"
    participant Service as "poseService / repCounter"

    User->>App: Mở WebView Camera & Chọn bài tập (VD: Squat, Push-up)
    App->>Backend: Kết nối Socket.IO & Emit event "pose:start" { exerciseName }
    Backend->>Service: Khởi tạo/Reset bộ đếm reps (repCounter.resetSession)
    Backend-->>App: Emit event "pose:started" { exerciseName }
    
    loop Real-time Extraction & Stream (~15 fps)
        App->>App: MediaPipe chạy trong WebView nhận dạng 33 landmarks cục bộ
        App->>App: Nhân tỷ lệ video tái cấu trúc tọa độ pixel & gán nhãn
        App->>Backend: Emit event "pose:evaluate" { user_id, exerciseName, keypoints, frameId }
        
        alt Frame cũ hoặc trễ hơn Frame đang xử lý
            Backend->>Backend: Bỏ qua frame (Skip old frames)
        else Frame mới hợp lệ
            Backend->>Service: Gọi evaluatePose({ keypoints, sessionKey })
            Note over Service: 1. Bỏ qua model TensorFlow trên Server, dùng trực tiếp keypoints<br/>2. Tính toán các góc khớp xương chính<br/>3. Đánh giá tính chuẩn xác của động tác (isCorrect)<br/>4. repCounter theo dõi thay đổi góc qua các frame (bỏ qua 'middle') để đếm Reps
            Service-->>Backend: Trả về kết quả (isCorrect, angles, repCount, phase)
            Backend-->>App: Emit event "pose:result" { frameId, isCorrect, score, repCount, phase }
            App-->>User: Vẽ skeleton cục bộ trên canvas WebView & Hiển thị nhịp đếm, nhắc nhở tư thế
        end
    end

    User->>App: Nhấn Dừng bài tập
    App->>Backend: Emit event "pose:stop" { exerciseName }
    Backend->>Service: Hủy session bộ đếm reps (repCounter.deleteSession)
    Backend-->>App: Emit event "pose:stopped" { exerciseName }
```

---

### 4. Phân tích video đếm số rep bất đồng bộ (Asynchronous Video Repetition Counting)
Mô tả quy trình tải lên một video bài tập đã quay sẵn. Node.js backend ghi nhận yêu cầu và xử lý ngầm (asynchronous background worker) bằng mô hình AI PoseRAC thông qua tiến trình Python chuyên sâu, xuất ra video thành phẩm có vẽ khung xương và đếm rep tự động.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant App as "Mobile App"
    participant Backend as "Node.js Backend"
    participant PoseRAC as "PoseRAC Service (video_inference_streaming.py)"
    participant DB as "MySQL Database"

    User->>App: Chọn video bài tập từ thư viện hoặc quay sẵn & nhấn "Phân tích"
    App->>Backend: Gửi POST /api/video-analysis/process (JWT, file video qua Multer)
    Note over Backend: Multer lưu file video vào:<br/>/uploads/videos/[userId]_[timestamp].mp4
    Backend->>DB: Tạo bản ghi VideoAnalysis với trạng thái 'processing'
    DB-->>Backend: Bản ghi đã được lưu (trả về analysisId)
    Backend-->>App: Trả về HTTP 202 Accepted { success: true, analysisId, status: 'processing' }
    
    Note over App: App hiển thị màn hình chờ và thực hiện polling định kỳ
    
    %% Xử lý bất đồng bộ ngầm
    Note over Backend, PoseRAC: Bắt đầu xử lý video ngầm (processVideoAsync)
    Backend->>PoseRAC: Gọi poseRACService.processVideo(videoPath, options)
    Note over PoseRAC: 1. Spawn tiến trình con (python video_inference_streaming.py)<br/>2. Load trọng số Model PyTorch (best_weights_PoseRAC.pth)<br/>3. Duyệt video frame-by-frame, trích xuất landmarks<br/>4. Dự đoán chu kỳ động tác thông qua thuật toán PoseRAC<br/>5. Vẽ khung xương & số rep lên video output và lưu file output mp4
    PoseRAC-->>Backend: Trả về kết quả stdout (Action type, Repetition count, output video path)
    
    Backend->>DB: Cập nhật bản ghi VideoAnalysis (status: 'completed', repetitionCount, outputVideoPath, processingTime)
    
    %% Polling & Streaming
    loop Kiểm tra trạng thái định kỳ (Polling)
        App->>Backend: Gửi GET /api/video-analysis/:id (JWT)
        Backend->>DB: Lấy thông tin bản ghi VideoAnalysis
        DB-->>Backend: Trả về thông tin bản ghi
        Backend-->>App: Trả về trạng thái hiện tại (completed / processing)
    end
    
    App->>App: Trạng thái chuyển sang 'completed'
    App->>Backend: Gửi GET /api/video-analysis/:id/video (JWT) để stream video kết quả
    Backend-->>App: Stream dữ liệu video chứa khung xương & chỉ số đếm (video/mp4)
    App-->>User: Phát video kết quả đếm số Rep hoàn thành
```

---

### 5. Gợi ý chế độ ăn & tập luyện cá nhân hóa (Gemini AI Recommendations)
Mô tả quy trình thu thập dữ liệu sức khỏe của người dùng, tạo prompt ngữ cảnh gửi tới Gemini AI, lưu trữ kế hoạch dinh dưỡng/bài tập vào DB và trả về kết quả cá nhân hóa cho người dùng.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant App as "Mobile App"
    participant Backend as "Node.js Backend"
    participant Gemini as "Gemini AI Service"
    participant DB as "MySQL Database"

    User->>App: Chọn tạo "Thực đơn dinh dưỡng" / "Lịch tập luyện mới" (Nhập thời gian, mục tiêu, dị ứng, sở thích ẩm thực)
    App->>Backend: Gửi POST /api/ai/generate-meal-plan hoặc /generate-workout-plan (JWT, options)
    Backend->>DB: Lấy chỉ số cơ thể gần nhất của người dùng (Bảng BodyMetrics)
    DB-->>Backend: Dữ liệu (Chiều cao, cân nặng, tỷ lệ mỡ, mục tiêu calo...)
    
    Backend->>Backend: Xây dựng Prompt có cấu trúc (gồm mục tiêu cá nhân, chỉ số TDEE/BMR tính toán, và các hạn chế dị ứng)
    Backend->>Gemini: Gửi Prompt yêu cầu tạo kế hoạch theo định dạng JSON chuẩn
    Gemini-->>Backend: Phản hồi JSON chứa lịch biểu ăn uống hoặc tập luyện hàng ngày
    
    Backend->>DB: Lưu kế hoạch mới vào bảng MealPlan / WorkoutPlan (Deactivate các kế hoạch cũ)
    DB-->>Backend: Đã lưu thành công
    Backend-->>App: Trả về thông tin kế hoạch dinh dưỡng / lịch tập chi tiết
    App-->>User: Hiển thị bảng gợi ý chế độ ăn uống, lượng calo mục tiêu và các bài tập theo ngày
```

---

## ⚙️ II. Nhóm Quản trị (Admin Workflows)

### 1. Quản lý Thư viện Bài tập & Cấu hình Động tác
Mô tả cách thức quản trị viên quản lý, thêm mới hoặc chỉnh sửa các động tác tập luyện hỗ trợ khung xương AI trên trang Admin Web Dashboard.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Quản trị viên"
    participant Web as "Admin Web Dashboard"
    participant Backend as "Node.js Backend"
    participant DB as "MySQL Database"

    Admin->>Web: Truy cập Danh sách bài tập AI -> Nhấn "Thêm bài tập"
    Admin->>Web: Nhập thông tin động tác (Tên, Mô tả, Màu sắc hiển thị, Các ngưỡng góc khớp chuẩn, Tệp tham chiếu)
    Web->>Backend: Gửi POST /api/admin/exercises (JWT Admin, Form data)
    Backend->>Backend: Kiểm tra phân quyền (isAdmin Middleware)
    alt Không phải Admin
        Backend-->>Web: Trả về lỗi 403 Forbidden
        Web-->>Admin: Hiển thị lỗi từ chối quyền truy cập
    else Hợp lệ
        Backend->>DB: Tạo bản ghi mới trong bảng `PoseExercises`
        DB-->>Backend: Thành công
        Backend-->>Web: Trả về bản ghi bài tập mới đã tạo (201 Created)
        Web-->>Admin: Hiển thị bài tập mới trên bảng danh sách quản lý
    end
```

---

## 📊 III. Nhóm Nghiệp vụ Phụ & Tiện ích (Secondary & Background Workflows)

### 1. Ghi nhận lịch sử và Tiến độ tập luyện (Workout Progress Tracking & Exercise Completion)
Mô tả quy trình ghi nhận khi người dùng hoàn thành từng bài tập (Exercise) hoặc hoàn thành cả ngày tập luyện (Workout Day), cập nhật tỷ lệ phần trăm tiến độ tổng thể của kế hoạch.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant App as "Mobile App"
    participant Backend as "Node.js Backend"
    participant DB as "MySQL Database"

    %% Hoàn thành bài tập riêng lẻ
    Note over User, DB: Quy trình Hoàn thành Bài tập riêng lẻ (Complete Exercise)
    User->>App: Nhấn hoàn thành một bài tập trong ngày
    App->>Backend: Gửi POST /api/workout-plan/exercise/:id/complete (JWT)
    Backend->>DB: Cập nhật WorkoutPlanDayExercise (isCompleted = true, completedAt)
    DB-->>Backend: Thành công
    Backend-->>App: Trả về trạng thái hoàn thành (200 OK)

    %% Hoàn thành toàn bộ ngày tập
    Note over User, DB: Quy trình Hoàn thành Ngày tập luyện (Complete Workout Day)
    User->>App: Nhấn hoàn thành toàn bộ ngày tập luyện
    App->>Backend: Gửi POST /api/workout-plan/day/:id/complete (JWT)
    Backend->>DB: 1. Cập nhật WorkoutPlanDay (isCompleted = true, completedAt)
    Backend->>DB: 2. Cập nhật toàn bộ các bài tập trong ngày đó sang completed
    Backend->>DB: 3. Đếm số ngày đã hoàn thành và số ngày tập thực tế của Plan
    Backend->>DB: 4. Cập nhật tiến độ (completedWorkouts, totalWorkouts) vào bảng WorkoutPlan
    DB-->>Backend: Thành công
    Backend-->>App: Trả về JSON { success: true, planProgress: { completedWorkouts, totalWorkouts, percentage } }
    App-->>User: Hiển thị hiệu ứng chúc mừng và cập nhật thanh tiến độ mới
```

---

### 2. Dịch vụ tự động nhắc nhở tập luyện (Automated Inactivity Reminders via Expo Push Notification)
Mô tả luồng quét định kỳ chạy ngầm (background cron worker) để tìm các tài khoản không phát sinh lịch sử tập luyện trong 2+ ngày gần nhất và tự động bắn thông báo đẩy (push notification) nhắc nhở qua Expo Gateway.

```mermaid
sequenceDiagram
    autonumber
    participant Cron as "Node.js Cron / Worker"
    participant Service as "reminderService"
    participant DB as "MySQL Database"
    participant Expo as "Expo Push Notification Service"
    participant App as "Mobile App"

    Note over Cron: Kích hoạt định kỳ<br/>(mỗi 2 phút ở chế độ Test / hàng ngày)
    Cron->>Service: Gọi scheduleReminders()
    Service->>DB: Truy vấn danh sách User có pushToken
    DB-->>Service: Trả về danh sách Users
    
    loop Duyệt qua từng User
        Service->>DB: Lấy lịch sử WorkoutPlanDayExercise hoàn thành gần nhất (sắp xếp giảm dần completedAt)
        DB-->>Service: Trả về bài tập hoàn thành cuối cùng (lastWorkoutDate)
        Service->>Service: Tính số ngày không hoạt động: daysSinceLastWorkout = hiện tại - lastWorkoutDate
        
        alt daysSinceLastWorkout >= 2 ngày
            Service->>DB: Lưu bản ghi thông báo mới vào bảng `Notifications` (type: 'workout_reminder')
            DB-->>Service: Thành công
            Service->>Expo: Gửi yêu cầu đẩy notification (Expo Push Token, Title, Body, Screen: 'Workout')
            Expo-->>Service: Trả về kết quả gửi (Tickets)
            Expo->>App: Gửi Push Notification tới thiết bị điện thoại của người dùng
            Note over App: Hiển thị Banner nhắc nhở trên màn hình khóa: "Time to workout! 🏋️"
        end
    end
```

---

### 3. Trò chuyện với Trợ lý ảo AI (AI Fitness Assistant Chat Flow)
Mô tả quy trình người dùng gửi câu hỏi tư vấn sức khỏe, tập luyện hoặc dinh dưỡng lên trợ lý ảo. Node.js backend ràng buộc prompt hệ thống và gọi Gemini AI xử lý trả về kết quả nhanh chóng.

```mermaid
sequenceDiagram
    autonumber
    actor User as "Người dùng"
    participant App as "Mobile App"
    participant Backend as "Node.js Backend"
    participant Gemini as "Gemini AI Service"

    User->>App: Nhập tin nhắn câu hỏi tư vấn (VD: "Làm sao để tập Squat đúng cách?")
    App->>Backend: Gửi POST /api/ai/chat (JWT, message)
    Backend->>Backend: Xây dựng Prompt hệ thống (Ràng buộc trợ lý chỉ trả lời các chủ đề về Fitness, Health, Nutrition,...)
    Backend->>Gemini: Gửi Prompt đã chuẩn hóa và câu hỏi của người dùng
    Gemini-->>Backend: Trả về câu trả lời dạng text
    Backend-->>App: Trả về JSON { success: true, response }
    App-->>User: Hiển thị tin nhắn trả lời từ trợ lý ảo lên giao diện chat
```


