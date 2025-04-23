
import { ReactNode, useEffect, useState } from 'react';
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
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

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

  // Use effect to prevent redirect loops and ensure auth state is stable
  useEffect(() => {
    if (!isLoading) {
      // Add a small delay to ensure auth state is fully processed
      const timer = setTimeout(() => {
        setHasCheckedAuth(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Don't render anything until auth is checked and not loading
  if (isLoading || !hasCheckedAuth) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
    </div>;
  }
  
  // Log detailed auth information for debugging
  console.log("RouteGuard auth check:", { 
    path: location.pathname,
    isAdmin,
    isAuthenticated: !!user,
    adminOnly,
    requireAuth
  });
  
  // If the current path is public, render it without restrictions
  if (publicPaths.includes(location.pathname) || location.pathname.startsWith('/blog/')) {
    return <>{children}</>;
  }
  
  // Special case for admin-login: always accessible, but redirect to /admin if already authenticated as admin
  if (location.pathname === '/admin-login') {
    if (user && isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <>{children}</>;
  }
  
  // Paths that start with /admin require admin privileges
  if (adminOnly || location.pathname.startsWith('/admin')) {
    if (!user) {
      console.log("Admin route: No user, redirecting to admin-login");
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }
    
    if (!isAdmin) {
      console.log("Admin route: User is not admin, redirecting to dashboard");
      return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }
    
    console.log("Admin route: User is admin, allowing access");
    return <>{children}</>;
  }
  
  // For all other routes, if user is not authenticated, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated or route doesn't require auth
  return <>{children}</>;
};

export default RouteGuard;
