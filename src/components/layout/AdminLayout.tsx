
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Shield } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  requiresAdmin?: boolean;
  title?: string;
  description?: string;
}

const AdminLayout = ({ 
  children, 
  requiresAdmin = true,
  title = "Admin Dashboard",
  description = "Manage your platform and users" 
}: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { isAdmin, isLoading, profile, user, session } = useAuth();
  
  // Add a check to ensure the user is an admin
  useEffect(() => {
    console.log("AdminLayout auth check:", { 
      isLoading, 
      isAdmin, 
      requiresAdmin,
      profile,
      userExists: !!user,
      sessionExists: !!session
    });

    // Only redirect if not loading and the check is complete
    if (!isLoading) {
      if (requiresAdmin && !isAdmin && !user) {
        console.log("Not logged in, redirecting to admin login");
        navigate('/admin-login', { replace: true });
      } else if (requiresAdmin && !isAdmin && user) {
        console.log("Not admin, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAdmin, isLoading, navigate, profile, requiresAdmin, user, session]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
        </div>
      </Layout>
    );
  }

  // Show an error message if not admin but still reaching this point
  if (requiresAdmin && !isAdmin) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have admin privileges. Please log in with an admin account.
          </AlertDescription>
          <div className="mt-4">
            <button 
              className="bg-tennis-green-600 text-white px-4 py-2 rounded"
              onClick={() => navigate('/admin-login', { replace: true })}
            >
              Go to Admin Login
            </button>
          </div>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-tennis-green-700 mb-2">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {children}
    </Layout>
  );
};

export default AdminLayout;
