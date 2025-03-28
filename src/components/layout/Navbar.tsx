
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users, MessageSquare, DollarSign, User } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-tennis-green-600">ServeSync</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link to="/dashboard" className="flex items-center text-sm font-medium transition-colors hover:text-tennis-green-600">
            Dashboard
          </Link>
          <Link to="/schedule" className="flex items-center text-sm font-medium transition-colors hover:text-tennis-green-600">
            <CalendarClock className="mr-2 h-4 w-4" />
            Schedule
          </Link>
          <Link to="/players" className="flex items-center text-sm font-medium transition-colors hover:text-tennis-green-600">
            <Users className="mr-2 h-4 w-4" />
            Players
          </Link>
          <Link to="/messages" className="flex items-center text-sm font-medium transition-colors hover:text-tennis-green-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Link>
          <Link to="/payments" className="flex items-center text-sm font-medium transition-colors hover:text-tennis-green-600">
            <DollarSign className="mr-2 h-4 w-4" />
            Payments
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm" className="hidden md:flex" asChild>
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button className="hidden md:flex bg-tennis-green-600 hover:bg-tennis-green-700">
            <Link to="/schedule/new">New Session</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
