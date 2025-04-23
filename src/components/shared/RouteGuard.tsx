
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

/**
 * A component that guards routes based on authentication status
 * - Unauthenticated users are redirected to the login page
 * - Admin routes require admin privileges
 * - Public routes (coming soon, login, etc.) are accessible to all
 */
const RouteGuard = ({ children, requireAuth = true, adminOnly = false }: RouteGuardProps) => {
  const { user, isAdmin, isLoading, authError } = useAuth();
  const location = useLocation();

  // Public routes that should always be accessible regardless of auth status
  const publicPaths = [
    '/',  // Make homepage public
    '/coming-soon',
    '/login',
    '/admin-login',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/contact',
    '/faq',
    '/blog',
    '/helpdesk'
  ];
  
  // Don't redirect while auth is still loading
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
    </div>;
  }
  
  // If the current path is public, render it without restrictions
  if (publicPaths.includes(location.pathname) || location.pathname.startsWith('/blog/')) {
    return <>{children}</>;
  }
  
  // Paths that start with /admin require admin privileges
  if (adminOnly || location.pathname.startsWith('/admin')) {
    console.log("Admin route check:", { user, isAdmin, authError });
    
    if (!user) {
      console.log("No user, redirecting to admin-login");
      return <Navigate to="/admin-login" state={{ from: location }} />;
    }
    
    if (!isAdmin) {
      console.log("User is not admin, redirecting to dashboard");
      return <Navigate to="/dashboard" state={{ from: location }} />;
    }
    
    console.log("User is admin, allowing access to admin route");
    return <>{children}</>;
  }
  
  // For all other routes, if user is not authenticated, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // User is authenticated or route doesn't require auth
  return <>{children}</>;
};

export default RouteGuard;
