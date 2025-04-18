
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
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
              <Route path="/" element={<Index />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/schedule/new" element={<NewSession />} />
              <Route path="/session/:sessionId" element={<SessionDetail />} />
              <Route path="/session/:sessionId/edit" element={<SessionEdit />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/new" element={<NewPlayer />} />
              <Route path="/players/:playerId" element={<PlayerDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/new" element={<NewMessage />} />
              <Route path="/message/:messageId" element={<MessageDetail />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payment/:paymentId" element={<PaymentDetail />} />
              <Route path="/account/billing" element={<AccountBilling />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="/payments/new" element={<NewPayment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/booking/:coachId" element={<CoachBooking />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
