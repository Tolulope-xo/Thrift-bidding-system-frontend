import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Spinner } from '../ui';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Spinner label="Loading…" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
