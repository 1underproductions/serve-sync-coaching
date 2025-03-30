
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Shield } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  requiresAdmin?: boolean;
}

const AdminLayout = ({ 
  children, 
  requiresAdmin = true 
}: AdminLayoutProps) => {
  const navigate = useNavigate();
  
  // In a real app, this would check if the current user is a super admin
  const checkAdminStatus = (): boolean => {
    // For demonstration purposes, we'll create a mock admin check
    // In production, this would verify against Supabase or another backend
    const isAdmin = localStorage.getItem("userRole") === "admin";
    return isAdmin;
  };

  useEffect(() => {
    // If admin access is required but user is not an admin, redirect to dashboard
    if (requiresAdmin && !checkAdminStatus()) {
      navigate("/dashboard");
    }
  }, [navigate, requiresAdmin]);

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-tennis-green-700 mb-2">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your platform and users</p>
      </div>
      {children}
    </Layout>
  );
};

export default AdminLayout;
