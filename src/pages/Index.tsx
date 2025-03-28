
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-tennis-green-600">ServeSync</span>
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
            <Button asChild variant="outline">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="tennis">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button asChild variant="tennis" size="sm">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-24 px-4 bg-gradient-to-b from-white to-tennis-green-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 space-y-6">
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Simplify Your Tennis Coaching Business
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  All-in-one scheduling, player management, and billing software designed for tennis coaches.
                </motion.p>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button asChild size="lg" variant="tennis">
                    <Link to="/signup">Get Started Free</Link>
                  </Button>
                </motion.div>
                <motion.p 
                  className="text-sm text-gray-500 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  14-day free trial · No credit card required
                </motion.p>
              </div>
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <img 
                  src="/lovable-uploads/232441c8-5827-4d0c-aa6e-df7fd889e942.png" 
                  alt="ServeSync Dashboard" 
                  className="w-full h-auto rounded-lg shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Powerful Features for Tennis Coaches</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to run your coaching business efficiently
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-tennis-green-50 p-6 rounded-lg border border-tennis-green-100">
                <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-gray-600">
                  Easily manage individual and group sessions, courts, and availability.
                </p>
              </div>
              
              <div className="bg-tennis-green-50 p-6 rounded-lg border border-tennis-green-100">
                <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Player Management</h3>
                <p className="text-gray-600">
                  Track player progress, store contact info, and manage communications.
                </p>
              </div>
              
              <div className="bg-tennis-green-50 p-6 rounded-lg border border-tennis-green-100">
                <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Payments & Billing</h3>
                <p className="text-gray-600">
                  Process payments, send invoices, and track coaching income.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4 bg-tennis-green-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Coaches Love ServeSync</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join hundreds of tennis coaches who have simplified their business
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                  <p className="text-gray-600">
                    Reduce administrative work by 75% with automated scheduling, reminders, and billing.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Increase Reliability</h3>
                  <p className="text-gray-600">
                    Reduce no-shows by 80% with automated reminders and easy rescheduling.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Grow Revenue</h3>
                  <p className="text-gray-600">
                    Coaches using ServeSync report a 30% increase in revenue through better organization and client retention.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-tennis-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-tennis-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Improve Player Experience</h3>
                  <p className="text-gray-600">
                    Provide a more professional experience for your players with seamless scheduling and communication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                One plan, everything included
              </p>
            </div>
            
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-tennis-green-600 p-6 text-white text-center">
                <h3 className="text-2xl font-bold">ServeSync Pro</h3>
                <p className="opacity-80 mt-1">All features included</p>
              </div>
              
              <div className="p-6 text-center">
                <p className="text-4xl font-bold">$29<span className="text-xl text-gray-500">/month</span></p>
                <p className="text-gray-500 mt-2">Billed monthly • Cancel anytime</p>
                
                <div className="mt-6">
                  <Button asChild size="lg" variant="tennis" className="w-full py-6">
                    <Link to="/signup">Start 14-Day Free Trial</Link>
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">No credit card required for trial</p>
                </div>
                
                <div className="mt-8 text-left">
                  <h4 className="font-semibold text-lg mb-4">Everything you need:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Unlimited scheduling</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Unlimited players & coaches</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Automated player communications</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Payment processing (2.9% + 30¢ per transaction)</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Advanced analytics & reporting</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Customer support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-tennis-green-600 text-white">
          <div className="container mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to simplify your coaching business?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join hundreds of tennis coaches who are saving time and growing their business with ServeSync.
            </p>
            <Button asChild size="lg" variant="tennis-outline" className="bg-white hover:bg-white/90">
              <Link to="/signup">Start Your Free Trial Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ServeSync</h3>
              <p className="text-gray-400">
                The all-in-one platform for tennis coaches.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white">Pricing</button></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Updates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} ServeSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
