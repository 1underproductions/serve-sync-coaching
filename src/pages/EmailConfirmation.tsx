
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const EmailConfirmation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mailgunTestStatus, setMailgunTestStatus] = useState<string | null>(null);

  // Log when component renders
  useEffect(() => {
    console.log("EmailConfirmation component rendered with email:", email);
    
    // Test Mailgun configuration on component load
    const testMailgunConfig = async () => {
      try {
        console.log("Testing Mailgun configuration...");
        const response = await fetch(`${window.location.origin}/functions/v1/custom-email/test-mailgun`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Mailgun test failed with status ${response.status}:`, errorText);
          setMailgunTestStatus(`Mailgun test failed (${response.status}): ${errorText || 'No response body'}`);
          return;
        }
        
        try {
          const data = await response.json();
          console.log("Mailgun test response:", data);
          setMailgunTestStatus(data.success ? 'Mailgun configuration looks good' : `Mailgun error: ${data.error}`);
        } catch (parseError) {
          console.error("Error parsing Mailgun test response:", parseError);
          setMailgunTestStatus(`Error parsing response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      } catch (error) {
        console.error("Error testing Mailgun:", error);
        setMailgunTestStatus(`Error testing Mailgun: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    testMailgunConfig();
  }, [email]);

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
      setIsResending(true);
      console.log(`Attempting to resend verification email to: ${email}`);
      
      // Increment resend counter
      setResendCount(prev => prev + 1);
      
      // First try direct call to custom-email function
      console.log("Calling custom-email function directly");
      
      try {
        const response = await fetch(`${window.location.origin}/functions/v1/custom-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'signup',
            email: email,
            data: {
              redirect_to: `${window.location.origin}/auth/callback`
            }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Custom email function failed with status ${response.status}:`, errorText);
          throw new Error(`Failed to send email (${response.status}): ${errorText || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log("Custom email function response:", result);
        
        setDebugInfo({
          method: "direct-function-call",
          timestamp: new Date().toISOString(),
          response: result,
          email: email,
          resendCount: resendCount + 1
        });
        
        if (result.success) {
          toast({
            title: "Email sent",
            description: `A new verification email has been sent to ${email}. Please check both inbox and spam folders.`,
          });
          return;
        }
      } catch (directError) {
        console.error("Error calling custom-email function directly:", directError);
        // Continue to fallback method
      }
      
      // Fallback to OTP method
      console.log("Falling back to Supabase signInWithOtp");
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        console.error("Supabase OTP error:", error);
        throw error;
      }
      
      console.log("Supabase OTP response:", data);
      setDebugInfo({
        method: "supabase-otp",
        timestamp: new Date().toISOString(),
        email: email,
        redirect: `${window.location.origin}/auth/callback`,
        resendCount: resendCount + 1
      });
      
      // Show a more detailed toast with information about the email
      toast({
        title: "Email sent",
        description: `A new verification email has been sent to ${email}. Please check both inbox and spam folders.`,
      });
    } catch (error: any) {
      console.error("Error resending email:", error);
      setDebugInfo({
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
        resendCount: resendCount + 1
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to resend email: ${error.message || "Unknown error"}. Please try again.`
      });
    } finally {
      setIsResending(false);
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
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="text-sm font-medium text-amber-800">Important note</h3>
                </div>
                <p className="mt-2 text-sm text-amber-700">
                  If you don't see the email in your inbox, please check your spam folder. The email comes from your Mailgun domain.
                </p>
              </div>
              
              {mailgunTestStatus && (
                <div className={`p-4 rounded-md ${mailgunTestStatus.includes('error') || mailgunTestStatus.includes('Error') || mailgunTestStatus.includes('failed') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`text-sm ${mailgunTestStatus.includes('error') || mailgunTestStatus.includes('Error') || mailgunTestStatus.includes('failed') ? 'text-red-700' : 'text-green-700'}`}>
                    {mailgunTestStatus}
                  </p>
                </div>
              )}
              
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
                    disabled={isResending}
                    className="w-full flex items-center justify-center"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Sending email...' : 'Resend verification email'}
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
              
              {debugInfo && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Debug Information:</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-60">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
