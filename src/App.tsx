
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import NewSession from "./pages/NewSession";
import SessionEdit from "./pages/SessionEdit";
import Players from "./pages/Players";
import NewPlayer from "./pages/NewPlayer";
import Messages from "./pages/Messages";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";

// New placeholder components for routes mentioned in spec
const Analytics = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
    <p>This page will display coaching analytics and performance metrics.</p>
  </div>
);

const Settings = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p>This page will allow configuration of your coaching account and preferences.</p>
  </div>
);

const Profile = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Profile</h1>
    <p>This page will display and allow editing of your coaching profile.</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/schedule/new" element={<NewSession />} />
          <Route path="/session/:sessionId/edit" element={<SessionEdit />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/new" element={<NewPlayer />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
