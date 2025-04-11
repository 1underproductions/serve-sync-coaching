
import React, { useEffect } from 'react';
import { HelpCircle } from "lucide-react";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const faqItems = [
    {
      question: "What is Tennexis?",
      answer: "Tennexis is a comprehensive platform designed for tennis coaches to manage their coaching business. It includes scheduling, player management, payment processing, and communication tools all in one place."
    },
    {
      question: "How do I get started with Tennexis?",
      answer: "Getting started is easy! Simply sign up for a free trial account, complete your profile, and start adding your players. Our intuitive interface will guide you through setting up your schedule and coaching packages."
    },
    {
      question: "Can my players book sessions directly through the platform?",
      answer: "Yes! Once you've added your players to the system, they can log in to their own portal where they can view your availability and book sessions based on the rules you set up."
    },
    {
      question: "How does billing work?",
      answer: "Tennexis offers flexible billing options. You can set up packages, single session rates, or subscription models. Payments can be collected automatically through the platform, or you can track external payments manually."
    },
    {
      question: "Is Tennexis suitable for tennis academies with multiple coaches?",
      answer: "Absolutely! Tennexis has features specifically designed for multi-coach operations. You can add multiple coaches to your account, manage their schedules, and track performance across your academy."
    },
    {
      question: "Can I use Tennexis on my mobile device?",
      answer: "Yes, Tennexis is fully responsive and works on all devices including smartphones and tablets. We also offer dedicated mobile apps for iOS and Android for an enhanced mobile experience."
    },
    {
      question: "How secure is my data on Tennexis?",
      answer: "We take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security practices and regularly undergo security audits to ensure your data remains protected."
    },
    {
      question: "What kind of reports can I generate?",
      answer: "Tennexis offers comprehensive reporting features including financial summaries, attendance reports, player progress tracking, and business analytics to help you make data-driven decisions for your coaching business."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about the Tennexis platform. If you can't find what you're looking for, please contact our support team.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-tennis-green-600 flex-shrink-0" />
                      <span>{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-7">
                      {item.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
            <p className="mb-6 text-gray-600">
              Our support team is ready to help you with any specific questions about our platform.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center bg-tennis-green-600 text-white px-6 py-3 rounded-lg hover:bg-tennis-green-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
