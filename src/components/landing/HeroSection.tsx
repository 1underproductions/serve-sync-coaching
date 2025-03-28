
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="py-16 md:py-28 tennis-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-tennis-green-800/20 to-tennis-blue-800/20 z-0"></div>
      <div className="absolute right-0 bottom-0 w-1/3 h-full bg-white/5 -skew-x-12 transform origin-bottom-right z-0"></div>
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">The Platform Tennis Coaches Love</span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Streamline Your Tennis Coaching Business</h1>
            <p className="text-xl mb-8 text-white/90 max-w-lg">Focus on developing champions while we handle the business side. The all-in-one platform built for tennis professionals.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-tennis-green-600 hover:bg-gray-100 rounded-full px-8">
                <Link to="/dashboard">Get Started Free</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="relative bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="aspect-[4/3] bg-tennis-green-50 relative">
                <img 
                  src="/lovable-uploads/262cd87f-693c-4e1a-bc5b-d3e801ceb62f.png" 
                  alt="Tennis coach working with player on court" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-tennis-green-500 flex items-center justify-center text-white font-bold">JD</div>
                    <div className="ml-3">
                      <p className="text-gray-900 font-medium">John's Next Lesson</p>
                      <p className="text-gray-600 text-sm">Today at 3:00 PM · Court 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-8 -bottom-8 bg-tennis-blue-500 text-white p-5 rounded-lg shadow-lg transform rotate-6">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="absolute -left-8 -top-8 bg-tennis-green-500 text-white p-5 rounded-lg shadow-lg transform -rotate-6">
              <Users className="w-8 h-8" />
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {["Used by 5,000+ coaches", "99.9% uptime", "Data security", "24/7 support"].map((item, index) => (
              <div key={index} className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white text-sm md:text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
