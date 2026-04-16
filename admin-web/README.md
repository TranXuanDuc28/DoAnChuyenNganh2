# Fitness Ecosystem Admin Dashboard

A powerful web-based administration panel for managing the Fitness AI ecosystem. Built with React and Vite, it provides administrators with complete control over users, workout content, and system analytics.

## 🔑 Key Features

- **Dashboard Analytics**: Real-time statistics on system usage and user growth.
- **User Management**: View, edit, and deactivate accounts. Create administrative users.
- **Content Management**:
  - Exercises: Database of all movements.
  - Workouts: Curated workout routines.
  - Pose Exercises: Specific configuration for AI analysis.
- **System Settings**: Global configuration for the ecosystem.

## 🛠️ Technology Stack

- **React**: UI library.
- **Vite**: Frontend tooling and build system.
- **Axios**: API communication.
- **Tailwind CSS**: Contemporary styling.
- **Context API**: State management.

## 🚀 Getting Started

1.  Navigate to the `admin-web/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3001` (or the next available port).

## 🛡️ Administrative Access

To access the panel, your user account must have the `admin` role.

### Creating an Admin Account

- **Via Script**:
  ```bash
  cd ../backend
  node scripts/create-admin.js your-email@example.com password123 FirstName LastName
  ```
- **Via SQL**:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
  ```

---
© 2024 Fitness AI - Admin Operations Team
