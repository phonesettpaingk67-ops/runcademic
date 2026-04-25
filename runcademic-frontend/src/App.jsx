import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Login from './pages/Login';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubmitTicket from './pages/student/SubmitTicket';
import MyTickets from './pages/student/MyTickets';
import Schedules from './pages/student/Schedules';
import Notifications from './pages/student/Notifications';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AssignedTickets from './pages/instructor/AssignedTickets';
import CreateSchedule from './pages/instructor/CreateSchedule';
import MySchedules from './pages/instructor/MySchedules';
import Tasks from './pages/instructor/Tasks';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AllTickets from './pages/admin/AllTickets';
import UserManagement from './pages/admin/UserManagement';
import Departments from './pages/admin/Departments';
import AllSchedules from './pages/admin/AllSchedules';
import Reports from './pages/admin/Reports';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('runcademic_user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submit-ticket"
          element={
            <ProtectedRoute requiredRole="student">
              <SubmitTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tickets"
          element={
            <ProtectedRoute requiredRole="student">
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/schedules"
          element={
            <ProtectedRoute requiredRole="student">
              <Schedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute requiredRole="student">
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/tickets"
          element={
            <ProtectedRoute requiredRole="instructor">
              <AssignedTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/create-schedule"
          element={
            <ProtectedRoute requiredRole="instructor">
              <CreateSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/tasks"
          element={
            <ProtectedRoute requiredRole="instructor">
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/schedules"
          element={
            <ProtectedRoute requiredRole="instructor">
              <MySchedules />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute requiredRole="admin">
              <AllTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute requiredRole="admin">
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedules"
          element={
            <ProtectedRoute requiredRole="admin">
              <AllSchedules />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
