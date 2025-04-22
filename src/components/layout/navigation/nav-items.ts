
import { 
  CalendarClock, 
  Users, 
  MessageSquare, 
  DollarSign, 
  BarChart, 
  Settings, 
  Home,
  Shield,
  Ticket,
  FileText,
  Bell,
  BookOpen,
  GraduationCap
} from "lucide-react";

export const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Schedule", path: "/schedule", icon: CalendarClock },
  { name: "Players", path: "/players", icon: Users },
  { name: "Messages", path: "/messages", icon: MessageSquare },
  { name: "Payments", path: "/payments", icon: DollarSign },
  { name: "Analytics", path: "/analytics", icon: BarChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const adminNavItems = [
  { name: "Admin Dashboard", path: "/admin", icon: Shield },
  { name: "Coaches", path: "/admin/coaches", icon: GraduationCap },
  { name: "Coach Verifications", path: "/admin/coach-verifications", icon: Shield },
  { name: "Programs", path: "/admin/programs", icon: CalendarClock },
  { name: "Transactions", path: "/admin/transactions", icon: DollarSign },
  { name: "Support Tickets", path: "/admin/tickets", icon: Ticket },
  { name: "Content Library", path: "/admin/content", icon: BookOpen },
  { name: "Messaging", path: "/admin/messaging", icon: Bell },
  { name: "Reports", path: "/admin/reports", icon: FileText },
  { name: "Admin Settings", path: "/admin/settings", icon: Settings },
];

