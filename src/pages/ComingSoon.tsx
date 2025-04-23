
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users, Clock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import CoachSignupForm from '@/components/waitlist/CoachSignupForm';

// Contact Modal UI (simple, reusable)
const ContactUsModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/functions/v1/send-support-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message
        })
      });
      if (!res.ok) throw new Error("Failed to send");

      setSent(true);
    } catch (err: any) {
      setError("Failed to send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button className="absolute right-4 top-4 text-xl text-gray-400 hover:text-tennis-green-500" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4">Contact Tennexis Support</h2>
        {sent ? (
          <div className="text-green-600 text-center font-medium py-6">Thank you! Your message has been sent.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Your Name</label>
              <input name="name" type="text" required className="w-full border px-3 py-2 rounded focus:outline-none" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Your Email</label>
              <input name="email" type="email" required className="w-full border px-3 py-2 rounded focus:outline-none" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Message</label>
              <textarea name="message" required className="w-full border px-3 py-2 rounded focus:outline-none" value={form.message} rows={4} onChange={handleChange}></textarea>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

const ComingSoon = () => {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-tennis-green-600">Tennexis</Link>
          <Button variant="outline" size="sm" onClick={() => setShowContact(true)}>
            <span className="flex items-center gap-2">
              Contact Us
            </span>
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
        <ContactUsModal open={showContact} onClose={() => setShowContact(false)} />
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
