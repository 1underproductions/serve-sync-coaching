
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import RouteGuard from "./components/shared/RouteGuard";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import NewSession from "./pages/NewSession";
import SessionEdit from "./pages/SessionEdit";
import SessionDetail from "./pages/SessionDetail";
import Players from "./pages/Players";
import NewPlayer from "./pages/NewPlayer";
import Messages from "./pages/Messages";
import NewMessage from "./pages/NewMessage";
import MessageDetail from "./pages/MessageDetail";
import Payments from "./pages/Payments";
import PaymentDetail from "./pages/PaymentDetail";
import AccountBilling from "./pages/AccountBilling";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import PlayerDetail from "./pages/PlayerDetail";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NewPayment from "@/pages/NewPayment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminUsers from "@/pages/Admin/AdminUsers";
import AdminTransactions from "@/pages/Admin/AdminTransactions";
import AdminSettings from "@/pages/Admin/AdminSettings";
import CoachBooking from "@/pages/CoachBooking";
import BookingSuccess from "@/pages/BookingSuccess";
import ComingSoon from "@/pages/ComingSoon";
import AdminCoachVerifications from "@/pages/Admin/AdminCoachVerifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes - accessible without authentication */}
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Root path - redirects to ComingSoon for unauthenticated users */}
              <Route path="/" element={
                <RouteGuard>
                  <Index />
                </RouteGuard>
              } />

              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={
                <RouteGuard>
                  <Dashboard />
                </RouteGuard>
              } />
              <Route path="/schedule" element={
                <RouteGuard>
                  <Schedule />
                </RouteGuard>
              } />
              <Route path="/schedule/new" element={
                <RouteGuard>
                  <NewSession />
                </RouteGuard>
              } />
              <Route path="/session/:sessionId" element={
                <RouteGuard>
                  <SessionDetail />
                </RouteGuard>
              } />
              <Route path="/session/:sessionId/edit" element={
                <RouteGuard>
                  <SessionEdit />
                </RouteGuard>
              } />
              <Route path="/players" element={
                <RouteGuard>
                  <Players />
                </RouteGuard>
              } />
              <Route path="/players/new" element={
                <RouteGuard>
                  <NewPlayer />
                </RouteGuard>
              } />
              <Route path="/players/:playerId" element={
                <RouteGuard>
                  <PlayerDetail />
                </RouteGuard>
              } />
              <Route path="/messages" element={
                <RouteGuard>
                  <Messages />
                </RouteGuard>
              } />
              <Route path="/messages/new" element={
                <RouteGuard>
                  <NewMessage />
                </RouteGuard>
              } />
              <Route path="/message/:messageId" element={
                <RouteGuard>
                  <MessageDetail />
                </RouteGuard>
              } />
              <Route path="/payments" element={
                <RouteGuard>
                  <Payments />
                </RouteGuard>
              } />
              <Route path="/payment/:paymentId" element={
                <RouteGuard>
                  <PaymentDetail />
                </RouteGuard>
              } />
              <Route path="/account/billing" element={
                <RouteGuard>
                  <AccountBilling />
                </RouteGuard>
              } />
              <Route path="/analytics" element={
                <RouteGuard>
                  <Analytics />
                </RouteGuard>
              } />
              <Route path="/settings" element={
                <RouteGuard>
                  <Settings />
                </RouteGuard>
              } />
              <Route path="/profile" element={
                <RouteGuard>
                  <Profile />
                </RouteGuard>
              } />
              <Route path="/blog" element={
                <RouteGuard>
                  <Blog />
                </RouteGuard>
              } />
              <Route path="/blog/:postId" element={
                <RouteGuard>
                  <BlogPost />
                </RouteGuard>
              } />
              <Route path="/payments/new" element={
                <RouteGuard>
                  <NewPayment />
                </RouteGuard>
              } />
              <Route path="/payment-success" element={
                <RouteGuard>
                  <PaymentSuccess />
                </RouteGuard>
              } />
              <Route path="/booking/:coachId" element={
                <RouteGuard>
                  <CoachBooking />
                </RouteGuard>
              } />
              <Route path="/booking-success" element={
                <RouteGuard>
                  <BookingSuccess />
                </RouteGuard>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <RouteGuard adminOnly={true}>
                  <AdminDashboard />
                </RouteGuard>
              } />
              <Route path="/admin/coaches" element={
                <RouteGuard adminOnly={true}>
                  <AdminUsers />
                </RouteGuard>
              } />
              <Route path="/admin/coach-verifications" element={
                <RouteGuard adminOnly={true}>
                  <AdminCoachVerifications />
                </RouteGuard>
              } />
              <Route path="/admin/transactions" element={
                <RouteGuard adminOnly={true}>
                  <AdminTransactions />
                </RouteGuard>
              } />
              <Route path="/admin/settings" element={
                <RouteGuard adminOnly={true}>
                  <AdminSettings />
                </RouteGuard>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
