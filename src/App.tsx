
import React, { useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { Toaster } from "./components/ui/toaster";

// Import all your pages here
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Other imports as needed

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Special route to handle hash fragment URLs from Supabase auth */}
        <Route 
          path="/reset-password/*" 
          element={<ResetPassword />} 
        />
        
        {/* Catch-all route to handle direct links with hash parameters */}
        <Route 
          path="*" 
          element={
            <Navigate to="/login" replace />
          }
        />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
};

export default App;
