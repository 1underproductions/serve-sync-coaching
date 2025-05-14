
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
  const { user, isAdmin, isLoading, profile } = useAuth();
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
    '/email-confirmation',
    '/contact',
    '/faq',
    '/blog',
    '/helpdesk',
    '/auth/callback', // Add auth callback route as public
    '/verify' // Add this to handle Supabase email verification routes
  ];

  // Use effect to prevent redirect loops and ensure auth state is stable
  useEffect(() => {
    if (!isLoading) {
      // Add a small delay to ensure auth state is fully processed
      const timer = setTimeout(() => {
        setHasCheckedAuth(true);
      }, 500); // Increased delay for more stable auth checking
      
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
    requireAuth,
    profile,
    search: location.search,
    hash: location.hash
  });
  
  // Special handling for errors in auth flow
  if (location.pathname === '/' && location.search && location.search.includes('error=')) {
    console.log("Detected error in auth redirect", location.search);
    // Redirect to the AuthCallback component to handle the error properly
    return <Navigate to={`/auth/callback${location.search}`} replace />;
  }
  
  // Special case for auth callback - always allow access
  if (location.pathname === '/auth/callback') {
    console.log("Processing auth callback route");
    return <>{children}</>;
  }
  
  // Handle Supabase email verification redirection
  // This special case checks if we're handling a verification callback
  if ((location.hash && location.hash.includes("type=signup")) || 
      (location.hash && location.hash.includes("type=recovery")) ||
      location.pathname.includes("/verify") ||
      (location.search && location.search.includes("error="))) {
    console.log("Processing auth confirmation/verification flow");
    return <Navigate to={`/auth/callback${location.search}`} replace />;
  }

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
