
import React from 'react';
import { CheckCircle, Users, Calendar, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-tennis-green-600 font-medium">FEATURES</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">Tools Built for Tennis Coaches</h2>
          <p className="text-xl text-gray-600">Everything you need to run your coaching business efficiently, all in one place.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-all"
          >
            <div className="w-16 h-16 bg-tennis-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-tennis-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-center">Player Management</h3>
            <p className="text-gray-600 text-center mb-6">Track player progress, store contact information, and maintain detailed profiles</p>
            <ul className="space-y-3">
              {["Player profiles", "Skill tracking", "Notes & feedback", "Communication history"].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-tennis-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-tennis-green-50 p-8 rounded-xl shadow-sm border-tennis-green-200 border hover:shadow-md transition-all"
          >
            <div className="w-16 h-16 bg-tennis-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-center">Smart Scheduling</h3>
            <p className="text-gray-600 text-center mb-6">Easily manage individual and group lessons with calendar integrations</p>
            <ul className="space-y-3">
              {["Calendar sync", "Automated reminders", "Court booking", "Recurring sessions"].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-tennis-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-all"
          >
            <div className="w-16 h-16 bg-tennis-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-8 w-8 text-tennis-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-center">Simple Payments</h3>
            <p className="text-gray-600 text-center mb-6">Handle one-time and subscription payments with integrated billing</p>
            <ul className="space-y-3">
              {["Online payments", "Subscription billing", "Payment reminders", "Financial reporting"].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-tennis-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
