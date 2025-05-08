
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import { ArrowRight, Award, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const About = () => {
  const location = useLocation();
  
  // Scroll to top when the component mounts or the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Tennexis</h1>
              <p className="text-xl text-gray-600 mb-8">
                Built by tennis coaches, for tennis coaches.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Tennexis was born out of frustration. After years of struggling with inadequate tools and 
                  spreadsheets to manage tennis coaching businesses, we knew there had to be a better way.
                </p>
                <p className="text-gray-600 mb-4">
                  Founded by active tennis coaches with over 20 years of combined experience, 
                  we set out to create the platform we wished we had - one that truly understands 
                  the unique challenges of running a coaching business.
                </p>
                <p className="text-gray-600">
                  Today, Tennexis is helping coaches around the world save time, increase revenue, 
                  and focus on what matters most - developing their players.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/lovable-uploads/8af60805-0f06-42eb-8de4-5b3d0e883627.png" 
                  alt="Tennis player with racket and ball basket" 
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-xl text-gray-600">
                To empower tennis coaches with the tools they need to grow their business 
                and deliver exceptional coaching experiences.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Clock className="h-10 w-10 text-tennis-green-500 mb-4" />,
                  title: "Save Time",
                  description: "Automate the administrative tasks that eat into your coaching time."
                },
                {
                  icon: <Users className="h-10 w-10 text-tennis-green-500 mb-4" />,
                  title: "Grow Your Business",
                  description: "Attract and retain more clients with professional tools and services."
                },
                {
                  icon: <Award className="h-10 w-10 text-tennis-green-500 mb-4" />,
                  title: "Improve Your Coaching",
                  description: "Focus on player development with better tracking and planning tools."
                }
              ].map((item, index) => (
                <div key={index} className="text-center p-6 border rounded-lg">
                  <div className="flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-tennis-green-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your coaching business?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join coaches around the world who are using Tennexis to manage their business more effectively.
            </p>
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-tennis-green-600 hover:bg-gray-100">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
