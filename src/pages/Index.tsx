import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Calendar, Users, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-tennis-green-600">ServeSync</span>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="#features" className="text-gray-600 hover:text-tennis-green-600 transition-colors">Features</Link>
            <Link to="#benefits" className="text-gray-600 hover:text-tennis-green-600 transition-colors">Benefits</Link>
            <Link to="#pricing" className="text-gray-600 hover:text-tennis-green-600 transition-colors">Pricing</Link>
            <Button asChild variant="outline">
              <Link to="/dashboard">Login</Link>
            </Button>
          </div>
          <Button asChild variant="outline" className="md:hidden">
            <Link to="/dashboard">Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
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
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                    <Link to="#demo">Watch Demo</Link>
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
                <p className="text-xl text-gray-600 mb-8">ServeSync handles the business side so you can spend more time on court doing what you love.</p>
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

        <section id="pricing" className="py-20 bg-white">
          <div className="container text-center">
            <span className="text-tennis-green-600 font-medium">PRICING</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">Choose the plan that fits your coaching business, with no hidden fees or long-term contracts.</p>
            
            <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex-1 border rounded-2xl overflow-hidden"
              >
                <div className="p-6 bg-gray-50 border-b">
                  <h3 className="text-xl font-bold">Basic</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-gray-600">Perfect for individual coaches</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4 mb-8 text-left">
                    {[
                      "Up to 30 players",
                      "Unlimited sessions",
                      "Basic scheduling",
                      "Online payments",
                      "Email support"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-tennis-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/dashboard">Start Free Trial</Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex-1 border rounded-2xl border-tennis-green-500 overflow-hidden shadow-lg relative"
              >
                <div className="absolute top-0 inset-x-0 bg-tennis-green-500 text-white text-sm py-1">
                  MOST POPULAR
                </div>
                <div className="p-6 bg-tennis-green-50 border-b border-tennis-green-200 pt-8">
                  <h3 className="text-xl font-bold">Pro</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-gray-600">For growing coaching businesses</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4 mb-8 text-left">
                    {[
                      "Unlimited players",
                      "Unlimited sessions",
                      "Advanced scheduling",
                      "Payment processing",
                      "Player analytics",
                      "Priority support",
                      "Custom branding"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-tennis-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="w-full">
                    <Link to="/dashboard">Start Free Trial</Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex-1 border rounded-2xl overflow-hidden"
              >
                <div className="p-6 bg-gray-50 border-b">
                  <h3 className="text-xl font-bold">Academy</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="mt-2 text-gray-600">For tennis academies & schools</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-4 mb-8 text-left">
                    {[
                      "Everything in Pro",
                      "Multiple coaches",
                      "Advanced reporting",
                      "Facility management",
                      "API access",
                      "White-label solution",
                      "Dedicated account manager"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-tennis-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/dashboard">Contact Sales</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 tennis-gradient text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Coaching Business?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of tennis coaches who use ServeSync to streamline their operations and grow their business.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-tennis-green-600 hover:bg-gray-100 rounded-full px-8">
                <Link to="/dashboard">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                <Link to="/dashboard">Schedule a Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <span className="text-2xl font-bold">ServeSync</span>
              <p className="mt-2 text-gray-400 max-w-md">The ultimate tennis coaching platform designed to help coaches manage their business with ease.</p>
              
              <div className="flex space-x-4 mt-4">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-tennis-green-600 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  {["Features", "Pricing", "Testimonials", "FAQ"].map((item, index) => (
                    <li key={index}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  {["About", "Blog", "Careers", "Contact"].map((item, index) => (
                    <li key={index}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  {["Terms", "Privacy", "Cookies", "Licenses"].map((item, index) => (
                    <li key={index}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ServeSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
