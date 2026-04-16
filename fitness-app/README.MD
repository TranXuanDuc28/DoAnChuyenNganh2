# Fitness AI Mobile Application

A state-of-the-art mobile application built with React Native and Expo, designed to help you reach your fitness goals through AI-powered pose detection, personalized workouts, and smart nutrition tracking.

## ✨ Features

- **Personalized Workout Plans**: AI-generated workout schedules tailored to your fitness level.
- **Pose Analysis**: Use your camera to get real-time feedback on your exercise form.
- **Social Feed**: Join challenges and share your progress with friends.
- **Nutrition Diary**: Track your daily meals and water intake.
- **AI Assistant**: A dedicated health assistant powered by Gemini AI.
- **Push Notifications**: Stay motivated with reminders and goal updates.

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Context API
- **Networking**: Axios
- **Animations**: Reanimated, Layout Animation
- **Icons**: Expo Vector Icons (Ionicons)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **Expo Go App**: Installed on your physical device or use an Android/iOS emulator.

### Setup

1.  Navigate to the `fitness-app/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file and set your Backend API host:
    ```env
    EXPO_PUBLIC_API_URL=http://your-local-ip:5000/api
    ```
4.  Start the application:
    ```bash
    npx expo start
    ```

### Mobile Connection Tips
- **Android Emulator**: Uses `10.0.2.2` as host.
- **Physical Device**: Ensure your phone and computer are on the same Wi-Fi network. Use your computer's local IP (e.g., `192.168.1.x`) in the `.env` file.

## 📁 Project Structure

- `screens/`: All application screens.
- `components/`: Reusable UI components.
- `context/`: Application state providers (Auth, Theme).
- `services/`: API integration layer.
- `theme/`: Global styles and color palettes.
- `utils/`: Helper functions.

---
© 2024 Fitness AI - Mobile Engineering Team