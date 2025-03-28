
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-tennis-green-600">ServeSync</span>
          <Button asChild variant="outline">
            <Link to="/dashboard">Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 tennis-gradient text-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Streamline Your Tennis Coaching Business</h1>
              <p className="text-xl mb-8">The all-in-one platform for professional tennis coaches and academies</p>
              <Button asChild size="lg" className="bg-white text-tennis-green-600 hover:bg-gray-100">
                <Link to="/dashboard">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Features Made for Tennis Coaches</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="w-16 h-16 bg-tennis-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tennis-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Player Management</h3>
                <p className="text-gray-600">Track player progress, store contact information, and maintain detailed profiles</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="w-16 h-16 bg-tennis-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tennis-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
                <p className="text-gray-600">Easily manage individual and group lessons with calendar integrations</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="w-16 h-16 bg-tennis-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-tennis-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Simple Payments</h3>
                <p className="text-gray-600">Handle one-time and subscription payments with integrated billing</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">Focus on Coaching, <br />Not Administration</h2>
                <p className="text-xl text-gray-600 mb-6">ServeSync handles the business side so you can spend more time on court doing what you love.</p>
                <ul className="space-y-2">
                  {["Reduce no-shows with automated reminders", "Simplify payment collection", "Maintain detailed player records", "Communicate effortlessly with players and parents"].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-tennis-green-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-sm border">
                <div className="aspect-video bg-gray-200 rounded-md mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Everything in One Place</h3>
                <p className="text-gray-600">Access your coaching business from anywhere, on any device. Keep track of sessions, players, and payments with ease.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Coaching Business?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of tennis coaches who use ServeSync to streamline their operations and grow their business.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                <Link to="/dashboard">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
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
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  {["Features", "Pricing", "Testimonials", "FAQ"].map((item, index) => (
                    <li key={index}>
                      <a href="#" className="text-gray-400 hover:text-white">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  {["About", "Blog", "Careers", "Contact"].map((item, index) => (
                    <li key={index}>
                      <a href="#" className="text-gray-400 hover:text-white">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  {["Terms", "Privacy", "Cookies", "Licenses"].map((item, index) => (
                    <li key={index}>
                      <a href="#" className="text-gray-400 hover:text-white">{item}</a>
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
