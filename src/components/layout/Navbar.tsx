
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarClock, 
  Users, 
  MessageSquare, 
  DollarSign, 
  User, 
  Menu,
  Bell,
  Search,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = () => {
    // In a real app, we would clear authentication tokens here
    
    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile Menu Button (Only visible on mobile) */}
        <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </button>
        
        {/* Branded Logo (Only visible on mobile) */}
        <div className="md:hidden flex-1 flex justify-center">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-tennis-green-600">ServeSync</span>
          </Link>
        </div>
        
        {/* Search Bar (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search players, sessions..." 
              className="w-full pl-10 py-2 pr-4 rounded-md border border-input bg-transparent text-sm" 
            />
          </div>
        </div>
        
        {/* Right side icons and menu */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-tennis-green-100">
                <span className="font-medium text-tennis-green-800">JD</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>John Doe</DropdownMenuLabel>
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                coach@example.com
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
