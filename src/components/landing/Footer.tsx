
import React from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Instagram } from "lucide-react";

const Footer = () => {
  const { isAdmin } = useAuth();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <span className="text-2xl font-bold">Tennexis</span>
            <p className="mt-2 text-gray-400 max-w-md">The ultimate tennis coaching platform designed to help coaches manage their business with ease.</p>
            
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://www.instagram.com/tennexis/" 
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-tennis-green-600 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Testimonials"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><Link to="/cookies-policy" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
                <li>
                  <Link 
                    to="/admin-login" 
                    className="text-tennis-green-500 hover:text-tennis-green-400 transition-colors font-semibold"
                  >
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Tennexis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
