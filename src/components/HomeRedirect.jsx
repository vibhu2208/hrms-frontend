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
  } else if (user.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  } else if (user.role === 'company_admin' || user.role === 'admin' || user.role === 'hr' || user.role === 'manager') {
    return <Navigate to="/dashboard" replace />;
  } else {
    // Default fallback
    return <Navigate to="/dashboard" replace />;
  }
};

export default HomeRedirect;
