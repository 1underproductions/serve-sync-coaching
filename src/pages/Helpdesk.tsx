import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";

const profileFAQ = [
  {
    question: "How do I update my profile and pricing?",
    answer: "Visit the Settings page from the sidebar menu. Here you can update your personal information, upload a profile picture, set your hourly rates, create lesson packages, add your qualifications and experience, and configure your booking preferences. Don't forget to save your changes!"
  },
  {
    question: "How do I set up lesson packages and discounts?",
    answer: "Navigate to Settings > Packages to create multi-session packages. Set the number of sessions, total price, and discount percentage. Players can purchase these packages for better value, and the system will automatically track remaining sessions."
  },
  {
    question: "How do I set my availability and booking preferences?",
    answer: "In Settings > Availability, you can set your weekly schedule, block out unavailable times, set minimum advance booking requirements, and configure automatic booking confirmations. This helps players book sessions at times that work for both of you."
  },
  {
    question: "How do I reset my password?",
    answer: "Go to your Account settings and use the 'Reset Password' option, or use the 'Forgot Password' link on the login page. You will receive an email with instructions to create a new secure password."
  },
  {
    question: "How do I backup and export my data?",
    answer: "Go to Settings > Data Management to export your player information, session history, and payment records. This feature helps you maintain backups and provides data for tax purposes or if you switch platforms."
  }
];

const playersFAQ = [
  {
    question: "How do I add a new player?",
    answer: "Navigate to the Players section from the sidebar menu and click 'Add Player.' Fill out the player's details including name, email, phone number, and any relevant notes about their skill level or goals. You can also add emergency contacts and set up payment preferences for each player."
  },
  {
    question: "How do I track player progress?",
    answer: "In each player's profile, you'll find a Progress section where you can log improvements, set goals, and track achievements over time. Use the session notes feature to document specific skills worked on and improvements noticed during each lesson."
  },
  {
    question: "How do I communicate with players and parents?",
    answer: "Use the Messages section to send direct messages to players or their emergency contacts. You can send session reminders, progress updates, schedule changes, or general communications. All message history is saved for your records."
  }
];

const schedulingFAQ = [
  {
    question: "How do I schedule a session?",
    answer: "Go to the Schedule tab from the main menu, select a date and time slot, choose the player(s) you want to schedule, add session details like location and description, set the session fee, and click 'Create Session.' You can also set up recurring sessions for regular weekly lessons."
  },
  {
    question: "How do I set up recurring sessions?",
    answer: "When creating a new session, look for the 'Recurring Session' option. Choose your frequency (weekly, biweekly, monthly), set the end date or number of occurrences, and the system will automatically create all sessions in the series. You can modify or cancel individual sessions in the series as needed."
  },
  {
    question: "How do I handle cancellations and rescheduling?",
    answer: "Go to the specific session in your Schedule, click 'Edit Session,' and you can either reschedule by changing the date/time or cancel the session entirely. Set up your cancellation policy in Settings to automatically apply fees or refunds based on notice given."
  },
  {
    question: "How do I handle no-shows and late cancellations?",
    answer: "Set up your policies in Settings > Booking Policies. You can automatically charge fees for no-shows or late cancellations, send automated reminders, and track patterns. The system can also block booking privileges for repeat offenders."
  },
  {
    question: "How can I send session notes to my players?",
    answer: "After each session, navigate to the session details page and click 'Add Session Notes.' Write your feedback, progress observations, and recommendations. You can then send these notes directly to the player's email. You can also configure automatic session note emails in your Coach Preferences."
  }
];

const paymentsFAQ = [
  {
    question: "How do I manage player payments and invoices?",
    answer: "Go to the Payments section to view all payment statuses. You can create payment links, send invoices, track overdue payments, and set up automatic payment reminders. Each player's payment history is also available in their individual profile page."
  },
  {
    question: "My payment link isn't working—what should I do?",
    answer: "First, check that your Stripe account is properly connected and active in Settings > Payments. Ensure your payment links haven't expired and that the amounts are correct. If you continue to have issues, try generating a new payment link or submit a support ticket below."
  }
];

const analyticsFAQ = [
  {
    question: "How do I view my analytics and business insights?",
    answer: "The Analytics section provides detailed insights into your coaching business including revenue trends, popular session times, player retention rates, and performance metrics. Use these insights to optimize your scheduling and pricing strategy."
  }
];

const supportFAQ = [
  {
    question: "How do I get help and contact support?",
    answer: "If your question isn't answered in this FAQ section, use the Support Ticket form below to contact our team. We typically respond within 24 hours. For urgent issues, mark your ticket as 'Urgent' in the category selection."
  }
];

const Helpdesk = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please enter a subject and message.", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    try {
      // Make sure we have a user ID
      if (!user?.id) {
        throw new Error("You must be logged in to submit a ticket");
      }

      console.log("Submitting ticket for user:", user.id);
      
      // Use Edge Function to create the ticket instead of direct database operation
      const response = await supabase.functions.invoke('create-support-ticket', {
        body: {
          userId: user.id,
          title: subject,
          description: message,
          category: "support"
        }
      });
      
      if (response.error) {
        console.error("Function response error:", response.error);
        throw response.error;
      }
      
      toast({ title: "Ticket submitted!", description: "Our support team will get back to you soon." });
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Ticket submission error:", err);
      toast({ 
        title: "Failed to submit ticket.", 
        description: "Please try again later or contact us directly.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Helpdesk & User Guide</h1>
          <p className="text-gray-600 mb-8">
            Comprehensive guides to help you make the most of your tennis coaching platform. Get answers to common questions or submit a support ticket if you need further assistance.
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <h2 className="text-2xl font-semibold mb-6 px-4 pt-4">Profile & Settings</h2>
              <Accordion type="single" collapsible className="w-full">
                {profileFAQ.map((item, idx) => (
                  <AccordionItem key={idx} value={`profile-q${idx}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left px-4 py-4 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-gray-700 leading-relaxed">{item.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="players" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <h2 className="text-2xl font-semibold mb-6 px-4 pt-4">Player Management</h2>
              <Accordion type="single" collapsible className="w-full">
                {playersFAQ.map((item, idx) => (
                  <AccordionItem key={idx} value={`players-q${idx}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left px-4 py-4 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-gray-700 leading-relaxed">{item.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <h2 className="text-2xl font-semibold mb-6 px-4 pt-4">Scheduling & Sessions</h2>
              <Accordion type="single" collapsible className="w-full">
                {schedulingFAQ.map((item, idx) => (
                  <AccordionItem key={idx} value={`scheduling-q${idx}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left px-4 py-4 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-gray-700 leading-relaxed">{item.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <h2 className="text-2xl font-semibold mb-6 px-4 pt-4">Payments & Billing</h2>
              <Accordion type="single" collapsible className="w-full">
                {paymentsFAQ.map((item, idx) => (
                  <AccordionItem key={idx} value={`payments-q${idx}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left px-4 py-4 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-gray-700 leading-relaxed">{item.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-2">
              <h2 className="text-2xl font-semibold mb-6 px-4 pt-4">Analytics & Reports</h2>
              <Accordion type="single" collapsible className="w-full">
                {analyticsFAQ.map((item, idx) => (
                  <AccordionItem key={idx} value={`analytics-q${idx}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left px-4 py-4 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-gray-700 leading-relaxed">{item.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Get Help & Support</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Support FAQ</h3>
                <Accordion type="single" collapsible className="w-full mb-6">
                  {supportFAQ.map((item, idx) => (
                    <AccordionItem key={idx} value={`support-q${idx}`} className="border-b last:border-b-0">
                      <AccordionTrigger className="text-left px-4 py-4 hover:bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="text-gray-700 leading-relaxed">{item.answer}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Submit a Support Ticket</h3>
                <p className="text-gray-600 mb-6">Can't find what you're looking for? Our support team is here to help!</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent"
                    placeholder="Subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                  />
                  <Textarea
                    placeholder="Describe your problem or question in detail..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="min-h-[120px] focus:ring-2 focus:ring-tennis-green-500"
                    required
                  />
                  <Button type="submit" variant="tennis" disabled={submitting} className="self-start">
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Helpdesk;
