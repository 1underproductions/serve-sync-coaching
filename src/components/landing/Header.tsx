
import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  // Function to handle smooth scrolling to sections when on homepage
  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      // If already on homepage, scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to homepage with section in hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container py-4 flex justify-between items-center">
        <span className="text-2xl font-bold text-tennis-green-600">Tennexis</span>
        <div className="hidden md:flex space-x-6 items-center">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-gray-600 hover:text-tennis-green-600 transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('benefits')} 
            className="text-gray-600 hover:text-tennis-green-600 transition-colors"
          >
            Benefits
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="text-gray-600 hover:text-tennis-green-600 transition-colors"
          >
            Pricing
          </button>
          <Button asChild variant="outline" className="mr-2">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/sign-up">Start Free Trial</Link>
          </Button>
        </div>
        <div className="flex items-center space-x-3 md:hidden">
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/sign-up">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
