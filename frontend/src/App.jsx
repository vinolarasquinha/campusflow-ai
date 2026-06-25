import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStudent } from './context/StudentContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import TaskManager from './pages/TaskManager';
import AiStudyBuddy from './pages/AiStudyBuddy';
import AttendanceAnalyzer from './pages/AttendanceAnalyzer';
import NoticeSummarizer from './pages/NoticeSummarizer';
import AutomationLogs from './pages/AutomationLogs';
import NotFoundPage from './pages/NotFoundPage';

import { toast } from 'react-hot-toast';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { activeStudent, loading } = useStudent();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-cyan border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm font-bold text-white tracking-wider">Syncing CampusFlow Workspace...</p>
      </div>
    );
  }

  if (!activeStudent) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboard" element={<OnboardingPage />} />

      {/* Portal Pages (Protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-buddy"
        element={
          <ProtectedRoute>
            <AiStudyBuddy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <AttendanceAnalyzer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <NoticeSummarizer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation-logs"
        element={
          <ProtectedRoute>
            <AutomationLogs />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
