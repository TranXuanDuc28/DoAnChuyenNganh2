# Fitness App Ecosystem

A comprehensive fitness platform featuring a mobile application for users, a backend with AI/ML capabilities for pose recognition, and a web-based admin dashboard.

## 🚀 Project Overview

This ecosystem is designed to provide users with a complete health and fitness tracking experience. It leverages AI to analyze exercise form through computer vision and provides personalized workout and nutrition recommendations.

### 🍱 Main Components

- **[Backend](backend/README.md)**: A Node.js Express server integrated with a Python ML service for real-time pose analysis.
- **[Fitness App](fitness-app/README.MD)**: A React Native (Expo) mobile application for users to track workouts, nutrition, and analyze their poses.
- **[Admin Web](admin-web/README.md)**: A React-based web dashboard (Vite) for system administration.

## 🏗️ Architecture (Sơ đồ kiến trúc)

Dưới đây là sơ đồ kiến trúc tổng quan các lớp (Multi-tier Architecture) của hệ thống:

```mermaid
graph TB
    %% Subgraphs for layered architecture
    subgraph Client_Layer["📱 Client Layer"]
        Mobile["Mobile App<br/>(React Native / Expo)"]
        AdminWeb["Admin Web Dashboard<br/>(React / Vite / Tailwind)"]
    end

    subgraph Backend_Layer["⚙️ Backend Application Server (Node.js & Express)"]
        APIRoutes["Express API Routes<br/>(/api/auth, /api/workouts, /api/pose, ...)"]
        WSServer["WebSocket Server<br/>(Socket.IO - Real-time Frame Handler)"]
        
        subgraph Core_Services["Business Logic & Services"]
            AuthMiddleware["JWT Auth Middleware"]
            PoseService["Pose Evaluation Service"]
            PoseRACService["PoseRAC Service (Async Video)"]
            AIService["AI Recommendation Service"]
        end
    end

    subgraph ML_Layer["🧠 AI / ML Services (Python Core)"]
        PyAuto["Yoga Posture ML Service<br/>(Mediapipe / main_auto.py)"]
        PyPoseRAC["PoseRAC Engine<br/>(PyTorch / video_inference_streaming.py)"]
    end

    subgraph Data_Layer["💾 Data Storage Layer"]
        DB[("MySQL Database<br/>(Sequelize ORM)")]
    end

    subgraph External_Layer["☁️ External Integrations"]
        GeminiAPI["Google Gemini AI API<br/>(LLM Recommendation Engine)"]
    end

    %% Connections
    Mobile <-->|"REST APIs (HTTPS)"| APIRoutes
    Mobile <-->|"WebSockets (Socket.IO)"| WSServer
    AdminWeb <-->|"REST APIs (HTTPS)"| APIRoutes

    APIRoutes --> AuthMiddleware
    WSServer --> PoseService
    APIRoutes --> PoseService
    APIRoutes --> PoseRACService
    APIRoutes --> AIService

    PoseService -->|"Spawn Child Process"| PyAuto
    PoseRACService -->|"Spawn Child Process"| PyPoseRAC
    AIService <-->|"Gemini Node SDK"| GeminiAPI
    
    AuthMiddleware --> DB
    PoseService -->|"Save Image Evaluation"| DB
    PoseRACService -->|"Save Video Analysis"| DB
    AIService -->|"Save Meal/Workout Plans"| DB
```

---

## 🔄 Luồng hoạt động chính (Main Activity Flow)

Sơ đồ dưới đây mô tả luồng trải nghiệm tập luyện cốt lõi của người dùng từ bước chọn bài tập đến khi nhận kết quả phân tích tư thế và đếm số rep tập luyện:

```mermaid
graph TD
    Start([Bắt đầu tập luyện]) --> ChooseEx[Chọn bài tập trong Thư viện]
    ChooseEx --> ChooseMode{Chọn chế độ tập}
    
    %% Real-time Mode Branch
    ChooseMode -->|Real-time Camera| RT_Start[Khởi động Camera & Kết nối Socket.IO]
    RT_Start --> RT_Stream[Stream frames ảnh camera lên Server]
    RT_Stream --> RT_Process[Server + Python phân tích khung xương & đếm rep]
    RT_Process --> RT_HUD[Phản hồi HUD thực tế ảo overlay & nhịp đếm lập tức]
    RT_HUD --> RT_Check{Hoàn thành bài tập?}
    RT_Check -->|Chưa| RT_Stream
    RT_Check -->|Rồi| SaveDB[Lưu kết quả tập luyện vào Cơ sở dữ liệu]
    
    %% Upload Video Mode Branch
    ChooseMode -->|Tải lên Video| Vid_Select[Quay video hoặc chọn video từ thiết bị]
    Vid_Select --> Vid_Upload[Upload video lên REST API]
    Vid_Upload --> Vid_Queue[Server đưa vào hàng đợi xử lý ngầm bất đồng bộ]
    Vid_Queue --> Vid_PoseRAC[Chạy mô hình PoseRAC phân tích động tác & đếm rep]
    Vid_PoseRAC --> Vid_Done[Cập nhật trạng thái completed & render video thành phẩm]
    Vid_Done --> Vid_Result[Người dùng xem kết quả & stream video khung xương]
    Vid_Result --> SaveDB
    
    SaveDB --> End([Xem thống kê tiến trình ở Dashboard])
```

---

## 📋 Chi tiết các luồng nghiệp vụ (Detailed Workflows)

Để tìm hiểu sâu hơn về luồng dữ liệu, quy trình bảo mật (JWT) và các tương tác API/WebSocket chi tiết cho từng nghiệp vụ, vui lòng xem:

👉 **[Tài liệu luồng nghiệp vụ chi tiết (docs/workflow.md)](docs/workflow.md)**

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Mobile App** | React Native, Expo, Axios, React Navigation |
| **Backend** | Node.js, Express, Sequelize (ORM), Socket.IO, JWT |
| **AI/ML** | Python, Mediapipe, TensorFlow.js |
| **Web Dashboard** | React, Vite, Tailwind CSS |
| **Database** | MySQL |

## 🏁 Getting Started

To get the entire system running, follow the setup guides in each sub-directory:

1.  **Backend Setup**: Follow instructions in `/backend/README.md`.
2.  **Mobile App Setup**: Follow instructions in `/fitness-app/README.MD`.
3.  **Admin Web Setup**: Follow instructions in `/admin-web/README.md`.

## 📁 Project Structure

- `backend/`: Node.js server and API logic.
- `fitness-app/`: Mobile application source code.
- `admin-web/`: Administrator dashboard source code.
- `docs/`: Reference documentation, SQL dumps, and reports.
- `tmp/`: Temporary processing files (ignored by git).

---

© 2024 Xuan Duc
