
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
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
import AccountBilling from "./pages/AccountBilling";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import PlayerDetail from "./pages/PlayerDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
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
          <Route path="/account/billing" element={<AccountBilling />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
