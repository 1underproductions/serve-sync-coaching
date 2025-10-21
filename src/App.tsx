
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RouteGuard from "./components/shared/RouteGuard";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Players = lazy(() => import("./pages/Players"));
const NewPlayer = lazy(() => import("./pages/NewPlayer"));
const EditPlayer = lazy(() => import("./pages/EditPlayer"));
const PlayerDetail = lazy(() => import("./pages/PlayerDetail"));
const Schedule = lazy(() => import("./pages/Schedule"));
const NewSession = lazy(() => import("./pages/NewSession"));
const SessionDetail = lazy(() => import("./pages/SessionDetail"));
const SessionEdit = lazy(() => import("./pages/SessionEdit"));
const Payments = lazy(() => import("./pages/Payments"));
const NewPayment = lazy(() => import("./pages/NewPayment"));
const PaymentDetail = lazy(() => import("./pages/PaymentDetail"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Messages = lazy(() => import("./pages/Messages"));
const NewMessage = lazy(() => import("./pages/NewMessage"));
const MessageDetail = lazy(() => import("./pages/MessageDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const CoachBooking = lazy(() => import("./pages/CoachBooking"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const AccountBilling = lazy(() => import("./pages/AccountBilling"));
const Helpdesk = lazy(() => import("./pages/Helpdesk"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/Admin/AdminUsers"));
const AdminContent = lazy(() => import("./pages/Admin/AdminContent"));
const AdminSettings = lazy(() => import("./pages/Admin/AdminSettings"));
const AdminTickets = lazy(() => import("./pages/Admin/AdminTickets"));
const AdminTransactions = lazy(() => import("./pages/Admin/AdminTransactions"));
const AdminCoachVerifications = lazy(() => import("./pages/Admin/AdminCoachVerifications"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/cookies" element={<CookiesPolicy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/booking/:coachId" element={<CoachBooking />} />
              <Route path="/booking-success" element={<BookingSuccess />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
              <Route path="/players" element={<RouteGuard><Players /></RouteGuard>} />
              <Route path="/players/new" element={<RouteGuard><NewPlayer /></RouteGuard>} />
              <Route path="/players/:playerId" element={<RouteGuard><PlayerDetail /></RouteGuard>} />
              <Route path="/players/:playerId/edit" element={<RouteGuard><EditPlayer /></RouteGuard>} />
              <Route path="/schedule" element={<RouteGuard><Schedule /></RouteGuard>} />
              <Route path="/schedule/new" element={<RouteGuard><NewSession /></RouteGuard>} />
              <Route path="/sessions/:sessionId" element={<RouteGuard><SessionDetail /></RouteGuard>} />
              <Route path="/sessions/:sessionId/edit" element={<RouteGuard><SessionEdit /></RouteGuard>} />
              <Route path="/payments" element={<RouteGuard><Payments /></RouteGuard>} />
              <Route path="/payments/new" element={<RouteGuard><NewPayment /></RouteGuard>} />
              <Route path="/payments/:paymentId" element={<RouteGuard><PaymentDetail /></RouteGuard>} />
              <Route path="/payment-success" element={<RouteGuard><PaymentSuccess /></RouteGuard>} />
              <Route path="/messages" element={<RouteGuard><Messages /></RouteGuard>} />
              <Route path="/messages/new" element={<RouteGuard><NewMessage /></RouteGuard>} />
              <Route path="/messages/:messageId" element={<RouteGuard><MessageDetail /></RouteGuard>} />
              <Route path="/profile" element={<RouteGuard><Profile /></RouteGuard>} />
              <Route path="/settings" element={<RouteGuard><Settings /></RouteGuard>} />
              <Route path="/analytics" element={<RouteGuard><Analytics /></RouteGuard>} />
              <Route path="/billing" element={<RouteGuard><AccountBilling /></RouteGuard>} />
              <Route path="/helpdesk" element={<RouteGuard><Helpdesk /></RouteGuard>} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<RouteGuard requireAdmin><AdminDashboard /></RouteGuard>} />
              <Route path="/admin/users" element={<RouteGuard requireAdmin><AdminUsers /></RouteGuard>} />
              <Route path="/admin/content" element={<RouteGuard requireAdmin><AdminContent /></RouteGuard>} />
              <Route path="/admin/settings" element={<RouteGuard requireAdmin><AdminSettings /></RouteGuard>} />
              <Route path="/admin/tickets" element={<RouteGuard requireAdmin><AdminTickets /></RouteGuard>} />
              <Route path="/admin/transactions" element={<RouteGuard requireAdmin><AdminTransactions /></RouteGuard>} />
              <Route path="/admin/verifications" element={<RouteGuard requireAdmin><AdminCoachVerifications /></RouteGuard>} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
