
import React, { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const faqCoach = [
  {
    question: "How do I add a new player?",
    answer: "Navigate to the Players section and click 'Add Player.' Fill out the details and save."
  },
  {
    question: "How do I schedule a session?",
    answer: "Go to the Schedule tab, select a date and time, add player(s), and click 'Create Session.'"
  },
  {
    question: "How do I update my profile or pricing?",
    answer: "Visit the Settings page to update your personal information, profile picture, and pricing details."
  },
  {
    question: "My payment link isn't working—what should I do?",
    answer: "First, check that your Stripe account is connected and active. If you continue to have issues, submit a ticket using the form below."
  },
  {
    question: "How can I send session notes to my players?",
    answer: "After each session, navigate to Session Notes, write your feedback, and click 'Send to Player.' You can also email these notes automatically from your Coach Preferences."
  },
  {
    question: "How do I reset my password?",
    answer: "Go to Account > Security, and use the 'Reset Password' option. You will receive an email with instructions."
  },
  {
    question: "How do I contact support?",
    answer: "If your question isn't answered here, use the Support Ticket form below to contact us."
  },
];

const Helpdesk = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

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
      // Use Edge Function to create the ticket instead of direct database operation
      // This avoids triggering the recursive RLS policy
      const { data, error } = await supabase.functions.invoke('create-support-ticket', {
        body: {
          userId: user?.id,
          title: subject,
          description: message,
          category: "support"
        }
      });
      
      if (error) throw error;
      
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
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container max-w-3xl py-10 flex-1">
        <h1 className="text-3xl font-bold mb-2 text-center">Helpdesk</h1>
        <p className="text-center text-gray-600 mb-8">
          Get answers to common questions or submit a support ticket if you need further assistance.
        </p>
        {/* FAQ SECTION */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqCoach.map((item, idx) => (
              <AccordionItem key={idx} value={`q${idx}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <span className="font-medium">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div>{item.answer}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        {/* SUBMIT TICKET */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-3">Submit a Support Ticket</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              className="border rounded px-3 py-2"
              placeholder="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
            <Textarea
              placeholder="Describe your problem or question..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
            <Button type="submit" variant="tennis" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Helpdesk;
