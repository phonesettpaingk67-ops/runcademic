/**
 * Protected Route Component
 * Routes that require authentication and specific roles
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/index';

export function ProtectedRoute({ children, requiredRoles = [] }) {
  const { user, token } = useAuthStore();

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p>Required role: {requiredRoles.join(' or ')}</p>
        <p>Your role: {user.role}</p>
        <a href="/dashboard">Go back to dashboard</a>
      </div>
    );
  }

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute requiredRoles={['admin']}>{children}</ProtectedRoute>;
}

export function UserRoute({ children }) {
  return (
    <ProtectedRoute requiredRoles={['user', 'student', 'instructor']}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children }) {
  return (
    <ProtectedRoute requiredRoles={['admin', 'user', 'student', 'instructor']}>
      {children}
    </ProtectedRoute>
  );
}
