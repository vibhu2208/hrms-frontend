import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
  const { user } = useAuth();
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Role-based redirection
  if (user.role === 'superadmin') {
    return <Navigate to="/super-admin/dashboard" replace />;
  } else if (user.role === 'hr') {
    // HR uses HR dashboard
    return <Navigate to="/dashboard" replace />;
  } else if (user.role === 'employee' || user.role === 'manager') {
    // Employee and Manager use employee portal
    return <Navigate to="/employee/dashboard" replace />;
  } else if (user.role === 'company_admin' || user.role === 'admin') {
    // Admin use admin dashboard
    return <Navigate to="/dashboard" replace />;
  } else {
    // Default fallback
    return <Navigate to="/dashboard" replace />;
  }
};

export default HomeRedirect;
