
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-gray-50">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <span className="text-tennis-green-600 font-medium">BENEFITS</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">Focus on Coaching, <br />Not Administration</h2>
            <p className="text-xl text-gray-600 mb-8">Tennexis handles the business side so you can spend more time on court doing what you love.</p>
            <ul className="space-y-4">
              {[
                "Reduce no-shows with automated reminders", 
                "Simplify payment collection", 
                "Maintain detailed player records", 
                "Communicate effortlessly with players and parents"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-tennis-green-100 text-tennis-green-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 rounded-full" size="lg">
              <Link to="/dashboard" className="flex items-center">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <div className="bg-white p-8 rounded-xl shadow-md relative">
              <div className="absolute -top-4 -right-4 bg-tennis-green-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                Coach Dashboard
              </div>
              <img 
                src="/lovable-uploads/232441c8-5827-4d0c-aa6e-df7fd889e942.png" 
                alt="Tennis player hitting a backhand on court" 
                className="w-full h-auto rounded-lg shadow-sm mb-6"
              />
              <h3 className="text-xl font-bold mb-2">Everything in One Place</h3>
              <p className="text-gray-600">Access your coaching business from anywhere, on any device. Keep track of sessions, players, and payments with ease.</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-1">Players</h4>
                  <p className="text-2xl font-bold text-tennis-green-600">48</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-1">Sessions</h4>
                  <p className="text-2xl font-bold text-tennis-blue-600">126</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
