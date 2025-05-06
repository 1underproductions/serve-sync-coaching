
import React from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "./components/ui/toaster";
import RouteGuard from "./components/shared/RouteGuard";

// Import all your pages here
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Schedule from "./pages/Schedule";
import Players from "./pages/Players";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCoachVerifications from "./pages/Admin/AdminCoachVerifications";
import AdminContent from "./pages/Admin/AdminContent";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminTickets from "./pages/Admin/AdminTickets";
import AdminTransactions from "./pages/Admin/AdminTransactions";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminLogin from "./pages/AdminLogin";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Handle reset password routes - both with and without hash fragments */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/*" element={<ResetPassword />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <RouteGuard>
            <Dashboard />
          </RouteGuard>
        } />
        <Route path="/schedule/*" element={
          <RouteGuard>
            <Schedule />
          </RouteGuard>
        } />
        <Route path="/players/*" element={
          <RouteGuard>
            <Players />
          </RouteGuard>
        } />
        <Route path="/payments/*" element={
          <RouteGuard>
            <Payments />
          </RouteGuard>
        } />
        <Route path="/analytics" element={
          <RouteGuard>
            <Analytics />
          </RouteGuard>
        } />
        <Route path="/settings/*" element={
          <RouteGuard>
            <Settings />
          </RouteGuard>
        } />
        <Route path="/profile" element={
          <RouteGuard>
            <Profile />
          </RouteGuard>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <RouteGuard adminOnly={true}>
            <AdminDashboard />
          </RouteGuard>
        } />
        <Route path="/admin/coaches" element={
          <RouteGuard adminOnly={true}>
            <AdminCoachVerifications />
          </RouteGuard>
        } />
        <Route path="/admin/content" element={
          <RouteGuard adminOnly={true}>
            <AdminContent />
          </RouteGuard>
        } />
        <Route path="/admin/settings" element={
          <RouteGuard adminOnly={true}>
            <AdminSettings />
          </RouteGuard>
        } />
        <Route path="/admin/tickets" element={
          <RouteGuard adminOnly={true}>
            <AdminTickets />
          </RouteGuard>
        } />
        <Route path="/admin/transactions" element={
          <RouteGuard adminOnly={true}>
            <AdminTransactions />
          </RouteGuard>
        } />
        <Route path="/admin/users" element={
          <RouteGuard adminOnly={true}>
            <AdminUsers />
          </RouteGuard>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
