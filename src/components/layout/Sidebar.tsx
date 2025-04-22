
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  CalendarClock, 
  Users, 
  MessageSquare, 
  DollarSign, 
  BarChart, 
  Settings, 
  LogOut, 
  Home,
  Shield,
  Ticket,
  FileText,
  Bell,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/useAuth";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Schedule", path: "/schedule", icon: CalendarClock },
  { name: "Players", path: "/players", icon: Users },
  { name: "Messages", path: "/messages", icon: MessageSquare },
  { name: "Payments", path: "/payments", icon: DollarSign },
  { name: "Analytics", path: "/analytics", icon: BarChart },
  { name: "Settings", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { name: "Admin Dashboard", path: "/admin", icon: Shield },
  { name: "Manage Users", path: "/admin/users", icon: Users },
  { name: "Programs", path: "/admin/programs", icon: CalendarClock },
  { name: "Transactions", path: "/admin/transactions", icon: DollarSign },
  { name: "Support Tickets", path: "/admin/tickets", icon: Ticket },
  { name: "Content Library", path: "/admin/content", icon: BookOpen },
  { name: "Messaging", path: "/admin/messaging", icon: Bell },
  { name: "Reports", path: "/admin/reports", icon: FileText },
  { name: "Admin Settings", path: "/admin/settings", icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, isAdmin, profile } = useAuth();
  const currentPath = location.pathname;
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Toast and navigation are handled in the signOut function
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="hidden md:flex flex-col h-screen border-r bg-white w-[240px] shrink-0">
      <div className="p-4 border-b">
        <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2">
          <span className="text-xl font-bold text-tennis-green-600">Tennexis</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {!isAdmin && navItems.map((item) => {
          const isActive = currentPath === item.path || 
            (item.path !== "/dashboard" && currentPath.startsWith(item.path));
            
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-tennis-green-50 text-tennis-green-700 font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
        {isAdmin && (
          <>
            {adminNavItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path !== "/admin" && currentPath.startsWith(item.path));
                
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-tennis-green-50 text-tennis-green-700 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        )}

        <div className="mt-6 pt-6 border-t">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
