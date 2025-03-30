
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container text-center">
        <span className="text-tennis-green-600 font-medium">PRICING</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">Everything you need to run your coaching business efficiently, for one straightforward price. No hidden fees or long-term contracts.</p>
        
        <div className="flex justify-center max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full border rounded-2xl border-tennis-green-500 overflow-hidden shadow-lg"
          >
            <div className="p-6 bg-tennis-green-50 border-b border-tennis-green-200">
              <h3 className="text-xl font-bold">Tennexis Pro</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 ml-2">for 2 weeks</span>
                <div className="mt-1">
                  <span className="text-2xl font-bold">$9.95</span>
                  <span className="text-gray-500">/month after trial</span>
                </div>
              </div>
              <p className="mt-2 text-gray-600 text-sm">Everything you need to manage your tennis coaching business</p>
              <Button asChild size="lg" className="w-full mt-4">
                <Link to="/sign-up">Start 14-Day Free Trial</Link>
              </Button>
            </div>
            <div className="p-6">
              <h4 className="font-semibold text-base mb-3 text-left">All features included:</h4>
              <div className="grid md:grid-cols-2 gap-y-2 gap-x-6 text-left">
                {[
                  "Player management (up to 100 players)",
                  "Unlimited scheduling & sessions",
                  "Automated reminders",
                  "Payment tracking",
                  "Basic analytics dashboard",
                  "Mobile friendly interface",
                  "Email support",
                  "Calendar integrations",
                  "Recurring sessions",
                  "Email notifications"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-4 w-4 text-tennis-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
