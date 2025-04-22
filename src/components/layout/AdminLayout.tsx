
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const { isAdmin, isLoading } = useAuth();
  
  useEffect(() => {
    // If auth check is complete and admin access is required but user is not an admin, redirect to dashboard
    if (!isLoading && requiresAdmin) {
      if (!isAdmin) {
        console.log("User is not an admin, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        console.log("User is admin, staying on admin page");
      }
    }
  }, [navigate, requiresAdmin, isAdmin, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
        </div>
      </Layout>
    );
  }

  // If admin access is required and user is not an admin, don't render content
  if (requiresAdmin && !isAdmin) {
    return null; // This will prevent content flash before redirect happens
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
