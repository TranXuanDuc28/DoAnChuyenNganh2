# Fitness Ecosystem Backend

This is the core server for the Fitness AI project, built with Node.js, Express, and MySQL. It handles user management, workout tracking, nutrition logging, and coordinates with the AI service for pose recognition.

## 🌟 Key Features

- **User Authentication**: Secure JWT-based login, registration, and profile management.
- **Pose Recognition API**: Automated exercise form analysis using MoveNet and a specialized Python service.
- **AI Recommendations**: Personalized workout and nutrition plans generated using Gemini AI.
- **Multi-Client support**: Serves both a Mobile App (React Native) and an Admin Dashboard (Vite).
- **WebSockets**: Real-time communication for live pose analysis.
- **Task Scheduling**: Automated workout reminders and data processing via cron jobs.

## 🛠️ Technology Stack

- **Node.js & Express**: API framework.
- **Sequelize ORM**: Database management (MySQL).
- **Socket.IO**: Real-time feedback.
- **TensorFlow.js**: Server-side computer vision.
- **Child Processes**: Integration with Python-based ML services.

## ⚙️ Configuration

1.  **Clone the project** and navigate to the `backend/` directory.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment Variables**:
    Create a `.env` file based on `.env.example`:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=fitness_app
    JWT_SECRET=your_secret_key
    GEMINI_API_KEY=your_gemini_key
    ```
4.  **Database Migration**:
    The system will automatically sync tables on startup. To seed initial data:
    ```bash
    npm run dev -- --seed
    ```

## 🚀 Running the Server

- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

## 🔌 API Endpoints (Overview)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth` | POST/GET | User authentication and session management. |
| `/api/pose/evaluate` | POST | Analyze exercise pose using TensorFlow.js (Base64/Keypoints). |
| `/api/pose/evaluate-pose` | POST | Deep analysis using Python ML service (Advanced). |
| `/api/workouts` | GET/POST | Manage workouts and exercise database. |
| `/api/nutrition` | GET/POST | Log meals and track nutritional intake. |
| `/api/admin` | ALL | Administrative tasks (User management, stats). |

## 🧠 ML Integration (Python Service)

The backend interacts with a Python-based pose recognition service located in `/Yoga-Posture-Detection-using-Mediapipe`.
Ensure you have Python installed and the required dependencies for that service to enable high-fidelity pose scoring.

---
© 2024 Fitness AI - Engineering Team
