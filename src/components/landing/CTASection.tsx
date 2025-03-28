
import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 tennis-gradient text-white">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Coaching Business?</h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of tennis coaches who use ServeSync to streamline their operations and grow their business.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-tennis-green-600 hover:bg-gray-100 rounded-full px-8">
            <Link to="/sign-up">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
