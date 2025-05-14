
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const EmailConfirmation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please go back to sign up to get a new verification email."
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: "A new verification email has been sent to your inbox."
      });
    } catch (error) {
      console.error("Error resending email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-4">
          <span className="text-2xl font-bold text-tennis-green-600">Tennexis</span>
        </Link>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            
            <p className="mt-2 text-center text-sm text-gray-600 max-w-sm mx-auto">
              We've sent a confirmation email to {email ? <span className="font-medium">{email}</span> : "your inbox"}. Please click the link in that email to verify your account.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-800">What happens next?</h3>
                <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the confirmation link in the email</li>
                  <li>Sign in with your credentials</li>
                  <li>Start managing your coaching business!</li>
                </ul>
              </div>
              
              <div className="flex flex-col space-y-3">
                {email && (
                  <Button 
                    variant="outline" 
                    onClick={handleResendEmail} 
                    className="w-full flex items-center justify-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend verification email
                  </Button>
                )}
                
                <Button asChild>
                  <Link to="/login" className="w-full flex items-center justify-center">
                    Go to sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  Didn't receive an email? Check your spam folder or{" "}
                  <Link to="/login" className="text-tennis-green-600 hover:text-tennis-green-500">
                    try signing in anyway
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
