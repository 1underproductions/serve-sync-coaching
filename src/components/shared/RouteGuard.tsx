
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/context/useAuth';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

/**
 * A component that guards routes based on authentication status
 * - Unauthenticated users are redirected to the coming soon page
 * - Admin routes require admin privileges
 * - Public routes (coming soon, login, etc.) are accessible to all
 */
const RouteGuard = ({ children, requireAuth = true, adminOnly = false }: RouteGuardProps) => {
  const { auth, isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Public routes that should always be accessible regardless of auth status
  const publicPaths = [
    '/coming-soon',
    '/login',
    '/admin-login',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/contact',
    '/faq'
  ];
  
  // Don't redirect while auth is still loading
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
    </div>;
  }
  
  // If the current path is public, render it without restrictions
  if (publicPaths.includes(location.pathname)) {
    return <>{children}</>;
  }
  
  // Paths that start with /admin require admin privileges
  if (adminOnly || location.pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return <Navigate to="/admin-login" state={{ from: location }} />;
    }
    
    if (!isAdmin) {
      return <Navigate to="/coming-soon" state={{ from: location }} />;
    }
    
    return <>{children}</>;
  }
  
  // For all other routes, if user is not authenticated, redirect to coming soon
  if (requireAuth && !isAuthenticated) {
    // Store the attempted URL for redirecting after login
    return <Navigate to="/coming-soon" state={{ from: location }} />;
  }

  // User is authenticated or route doesn't require auth
  return <>{children}</>;
};

export default RouteGuard;
