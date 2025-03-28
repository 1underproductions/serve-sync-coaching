
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";

// Define form validation schema
const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Initialize form
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetFormValues) => {
    try {
      // For now, this is mocked - we'll integrate Supabase auth here later
      console.log("Reset password request:", data);
      
      // Show success toast
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link",
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Request failed",
        description: "There was an error sending the reset link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-tennis-green-600">
            ServeSync
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
          {!isSubmitted ? (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Reset Your Password</h1>
                <p className="text-gray-600 mt-2">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="coach@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <Button type="submit" className="w-full" variant="tennis">
                      Send Reset Link
                    </Button>
                    <div className="text-center text-sm">
                      <Link
                        to="/login"
                        className="text-tennis-green-600 hover:underline"
                      >
                        Back to login
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center py-8">
              <h2 className="text-xl font-bold text-tennis-green-600 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to your email address.
                Please check your inbox and follow the instructions.
              </p>
              <Button asChild variant="outline">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
