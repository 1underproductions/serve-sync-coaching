
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  className?: string;
}

const Layout = ({ 
  children, 
  fullWidth = false, 
  maxWidth = "7xl", 
  className = "" 
}: LayoutProps) => {
  const getMaxWidthClass = () => {
    if (fullWidth) return "px-4 py-6";
    
    switch (maxWidth) {
      case "sm": return "container mx-auto px-4 py-6 max-w-sm";
      case "md": return "container mx-auto px-4 py-6 max-w-md";
      case "lg": return "container mx-auto px-4 py-6 max-w-lg";
      case "xl": return "container mx-auto px-4 py-6 max-w-xl";
      case "2xl": return "container mx-auto px-4 py-6 max-w-2xl";
      case "7xl": return "container mx-auto px-4 py-6 max-w-7xl";
      case "full": return "w-full px-4 py-6";
      default: return "container mx-auto px-4 py-6 max-w-7xl";
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-x-hidden">
        <Navbar />
        <main className={`flex-1 ${getMaxWidthClass()} ${className}`}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
