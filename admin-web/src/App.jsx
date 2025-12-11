import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Exercises from './pages/Exercises';
import ImportExercises from './pages/ImportExercises';
import Workouts from './pages/Workouts';
import WorkoutPlans from './pages/WorkoutPlans';
import Settings from './pages/Settings';
import ExerciseCategories from './pages/ExerciseCategories';
import PoseExercises from './pages/PoseExercises';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="exercises/import" element={<ImportExercises />} />
            <Route path="exercise-categories" element={<ExerciseCategories />} />
            <Route path="pose-exercises" element={<PoseExercises />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="workout-plans" element={<WorkoutPlans />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;




