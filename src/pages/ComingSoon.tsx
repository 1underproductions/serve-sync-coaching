
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-tennis-green-600">Tennexis</Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container max-w-4xl py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-block p-4 bg-tennis-green-100 rounded-full mb-6">
              <div className="h-16 w-16 bg-tennis-green-500 rounded-full flex items-center justify-center text-white">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Coming Soon</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We're working hard to bring you an amazing tennis coaching experience. 
              This feature will be available soon!
            </p>
            
            <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-4">Get Notified When We Launch</h2>
              <p className="text-gray-600 mb-6">
                Sign up to receive updates and be the first to know when this feature goes live.
              </p>
              
              <form className="space-y-4">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green-500"
                    />
                  </div>
                  <Button>Notify Me</Button>
                </div>
              </form>
              
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-gray-500">
                  Have questions? <Link to="/contact" className="text-tennis-green-600 font-medium">Contact us</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="container text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tennexis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
