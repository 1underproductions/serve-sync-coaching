import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users, Clock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import CoachSignupForm from '@/components/waitlist/CoachSignupForm';

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-tennis-green-600">Tennexis</Link>
          <Button asChild variant="outline" size="sm">
            <a href="mailto:contact@tennexis.com" className="flex items-center gap-2">
              Contact Us
            </a>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container max-w-6xl py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-tennis-green-600 to-tennis-blue-600">
              The Future of Tennis Coaching Is Coming
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the waitlist for early access to the ultimate tennis coaching platform. 
              Streamline your coaching business and focus on what matters most - developing champions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CoachSignupForm />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CalendarClock, text: "Smart Scheduling" },
                  { icon: Users, text: "Player Management" },
                  { icon: Clock, text: "Time Saving Tools" },
                  { icon: Mail, text: "Automated Communication" }
                ].map(({ icon: Icon, text }, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-tennis-green-100 flex items-center justify-center text-tennis-green-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <img 
                  src="/lovable-uploads/232441c8-5827-4d0c-aa6e-df7fd889e942.png" 
                  alt="Tennis coaching platform preview" 
                  className="w-full h-auto rounded-lg shadow-sm mb-6"
                />
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">What's Coming</h3>
                  <ul className="space-y-3">
                    {[
                      "Complete coaching business management",
                      "Automated scheduling and reminders",
                      "Player progress tracking",
                      "Integrated payments and billing",
                      "Mobile-friendly interface"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg 
                          className="h-6 w-6 text-tennis-green-500 flex-shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 12l2 2 4-4" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
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
