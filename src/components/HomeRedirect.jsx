import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'superadmin') {
    return <Navigate to="/super-admin/dashboard" replace />;
  } else if (user?.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export default HomeRedirect;
