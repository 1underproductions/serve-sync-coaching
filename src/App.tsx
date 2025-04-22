
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import ComingSoon from "@/pages/ComingSoon";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminUsers from "@/pages/Admin/AdminUsers";
import AdminTransactions from "@/pages/Admin/AdminTransactions";
import AdminSettings from "@/pages/Admin/AdminSettings";
import AdminCoachVerifications from "@/pages/Admin/AdminCoachVerifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Custom ProtectedAdminRoute component for admin pages
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  // (In production you'd add proper admin auth checks here, but for now all /admin routes are accessible)
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Coming Soon page */}
              <Route path="/coming-soon" element={<ComingSoon />} />
              {/* Admin routes still accessible directly */}
              <Route path="/admin" element={
                <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>
              } />
              <Route path="/admin/coaches" element={
                <ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>
              } />
              <Route path="/admin/transactions" element={
                <ProtectedAdminRoute><AdminTransactions /></ProtectedAdminRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>
              } />
              <Route path="/admin/coach-verifications" element={
                <ProtectedAdminRoute><AdminCoachVerifications /></ProtectedAdminRoute>
              } />
              {/* All other routes go to ComingSoon */}
              <Route path="*" element={<Navigate to="/coming-soon" replace />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
