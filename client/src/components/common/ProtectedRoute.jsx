import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="loader" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

export default ProtectedRoute;
