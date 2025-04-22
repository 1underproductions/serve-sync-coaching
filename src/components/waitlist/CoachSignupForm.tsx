import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  yearsExperience: z.string().regex(/^\d+$/, "Must be a valid number"),
  message: z.string().optional(),
});

type FormData = {
  email: string;
  fullName: string;
  yearsExperience: string;
  message: string;
};

const CoachSignupForm = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    fullName: '',
    yearsExperience: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If honeypot is filled, silently reject (bot detected)
    if (honeypot) {
      console.log("Spam submission detected and blocked");
      toast({
        title: "Thank you for your interest!",
        description: "We'll notify you when Tennexis launches.",
      });
      setFormData({
        email: '',
        fullName: '',
        yearsExperience: '',
        message: '',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate form data
      formSchema.parse(formData);

      console.log("Submitting waitlist signup with data:", formData);

      // Convert yearsExperience to integer
      const yearsExp = parseInt(formData.yearsExperience);
      
      // Insert into Supabase - explicitly log the insert attempt
      console.log("Inserting into waitlist_signups table:", {
        email: formData.email,
        full_name: formData.fullName,
        years_experience: yearsExp,
        message: formData.message || null,
        status: 'pending'
      });
      
      const { data, error } = await supabase
        .from('waitlist_signups')
        .insert([{  
          email: formData.email,
          full_name: formData.fullName,
          years_experience: yearsExp,
          message: formData.message || null,
          status: 'pending'
        }]);

      if (error) {
        console.error("Supabase error on waitlist signup:", error);
        throw error;
      }
      
      console.log("Signup successful, returned data:", data);
      
      toast({
        title: "Thank you for joining the waitlist!",
        description: "We'll notify you when Tennexis launches.",
      });
      
      // Clear form
      setFormData({
        email: '',
        fullName: '',
        yearsExperience: '',
        message: '',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        toast({
          title: "Invalid form data",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Submission error:", error);
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Join Our Tennis Coach Community</h2>
      <p className="text-gray-600 mb-6">
        Be the first to know when we launch and receive exclusive early-bird offers.
      </p>
      
      {/* Honeypot field */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{ display: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            type="email"
            name="email"
            placeholder="Your email"
            className="pl-10"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            type="text"
            name="fullName"
            placeholder="Full name"
            className="pl-10"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Input 
            type="text"
            name="yearsExperience"
            placeholder="Years of coaching experience"
            value={formData.yearsExperience}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Textarea
            name="message"
            placeholder="Tell us about your coaching experience (optional)"
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="h-24"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Waitlist"}
        </Button>
      </div>
    </form>
  );
};

export default CoachSignupForm;
