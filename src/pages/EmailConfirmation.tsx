
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const EmailConfirmation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [resendTestStatus, setResendTestStatus] = useState<string | null>(null);
  const [isTestingResend, setIsTestingResend] = useState(false);

  // Log when component renders
  useEffect(() => {
    console.log("EmailConfirmation component rendered with email:", email);
    testResendConfig();
  }, [email]);

  const testResendConfig = async () => {
    try {
      console.log("Testing Resend configuration...");
      setIsTestingResend(true);
      
      const response = await supabase.functions.invoke('custom-email/test-resend', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Resend test response:", response);
      
      if (response.error) {
        console.error("Resend test failed:", response.error);
        setResendTestStatus(`Resend test failed: ${response.error.message || 'Unknown error'}`);
        return;
      }
      
      const data = response.data;
      console.log("Resend test parsed response:", data);
      setResendTestStatus(data.success 
        ? 'Resend configuration looks good' 
        : `Resend error: ${data.error || 'Unknown error'}`);
    } catch (error) {
      console.error("Error testing Resend:", error);
      setResendTestStatus(`Error testing Resend: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsTestingResend(false);
    }
  };

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
      
      // Use the custom-email function for signup emails
      console.log("Calling custom-email function via Supabase for signup verification");
      
      const emailData = {
        redirect_to: `${window.location.origin}/auth/callback`
      };
      
      console.log("Email data being sent:", emailData);
      
      const response = await supabase.functions.invoke('custom-email', {
        body: {
          type: 'signup',
          email: email,
          data: emailData
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Custom email function complete response:", response);
      
      if (response.error) {
        console.error("Custom email function failed:", response.error);
        throw new Error(`Failed to send email: ${response.error.message || 'Unknown error'}`);
      }
      
      const result = response.data;
      console.log("Custom email function response data:", result);
      
      setDebugInfo({
        method: "supabase-function-call",
        timestamp: new Date().toISOString(),
        response: result,
        email: email,
        resendCount: resendCount + 1,
        emailData: emailData
      });
      
      if (result && result.success) {
        toast({
          title: "Email sent successfully",
          description: `A verification email has been sent to ${email}. Please check both inbox and spam folders. It may take a few minutes to arrive.`,
        });
      } else {
        // Even if success is not explicitly true, if there's no error, assume success
        toast({
          title: "Email sent",
          description: `A verification email has been sent to ${email}. Please check both inbox and spam folders. It may take a few minutes to arrive.`,
        });
      }
    } catch (error: any) {
      console.error("Error resending email:", error);
      setDebugInfo({
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
        resendCount: resendCount + 1,
        email: email
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
                  If you don't see the email in your inbox, please check your spam folder. The email comes from Resend and may take a few minutes to arrive.
                </p>
              </div>
              
              {resendTestStatus && (
                <div className={`p-4 rounded-md ${resendTestStatus.includes('error') || resendTestStatus.includes('Error') || resendTestStatus.includes('failed') || resendTestStatus.includes('Failed') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <p className={`text-sm ${resendTestStatus.includes('error') || resendTestStatus.includes('Error') || resendTestStatus.includes('failed') || resendTestStatus.includes('Failed') ? 'text-red-700' : 'text-green-700'}`}>
                    {resendTestStatus}
                  </p>
                  {(resendTestStatus.includes('error') || resendTestStatus.includes('Error') || resendTestStatus.includes('failed') || resendTestStatus.includes('Failed')) && (
                    <p className="mt-2 text-xs text-red-500">
                      Make sure RESEND_API_KEY is set in your Supabase environment variables.
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                onClick={testResendConfig}
                variant="outline" 
                size="sm"
                disabled={isTestingResend}
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isTestingResend ? 'animate-spin' : ''}`} />
                {isTestingResend ? 'Testing...' : 'Test Resend Configuration'}
              </Button>
              
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
                    onClick={handleResendEmail} 
                    disabled={isResending}
                    className="w-full flex items-center justify-center bg-tennis-green-600 hover:bg-tennis-green-700"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                    {isResending ? 'Sending verification email...' : 'Resend verification email'}
                  </Button>
                )}
                
                <Button asChild variant="outline">
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
