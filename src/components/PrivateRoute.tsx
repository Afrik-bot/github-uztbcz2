import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, hasCompletedOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Allow access to discover page even if onboarding is not complete
  if (location.pathname === '/discover') {
    return <>{children}</>;
  }

  // Redirect to discover if onboarding is not complete
  if (!hasCompletedOnboarding) {
    return <Navigate to="/discover" replace />;
  }

  return <>{children}</>;
}