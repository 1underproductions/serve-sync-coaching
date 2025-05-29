
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, RefreshCw, AlertCircle, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
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
  const [domainVerificationStatus, setDomainVerificationStatus] = useState<'checking' | 'verified' | 'unverified' | 'error'>('checking');

  // Log when component renders
  useEffect(() => {
    console.log("EmailConfirmation component rendered with email:", email);
    testResendConfig();
  }, [email]);

  const testResendConfig = async () => {
    try {
      console.log("Testing Resend configuration...");
      setIsTestingResend(true);
      setDomainVerificationStatus('checking');
      
      const response = await supabase.functions.invoke('custom-email/test-resend', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Resend test response:", response);
      
      if (response.error) {
        console.error("Resend test failed:", response.error);
        setResendTestStatus(`❌ Resend test failed: ${response.error.message || 'Unknown error'}`);
        setDomainVerificationStatus('error');
        return;
      }
      
      const data = response.data;
      console.log("Resend test parsed response:", data);
      
      if (data.success) {
        if (data.testApiCall === 'successful') {
          setResendTestStatus('✅ Resend API connection verified - Test email sent successfully!');
          setDomainVerificationStatus('verified');
        } else {
          setResendTestStatus('✅ Resend configuration looks good - Check your domain verification in Resend dashboard');
          setDomainVerificationStatus('unverified');
        }
      } else {
        setResendTestStatus(`❌ Resend error: ${data.error || 'Unknown error'}`);
        setDomainVerificationStatus('error');
      }
    } catch (error) {
      console.error("Error testing Resend:", error);
      setResendTestStatus(`❌ Error testing Resend: ${error instanceof Error ? error.message : String(error)}`);
      setDomainVerificationStatus('error');
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
      console.log(`=== STARTING EMAIL RESEND ATTEMPT #${resendCount + 1} ===`);
      console.log(`Attempting to resend verification email to: ${email}`);
      
      // Increment resend counter
      setResendCount(prev => prev + 1);
      
      // Use the custom-email function for signup emails
      console.log("Calling custom-email function via Supabase for signup verification");
      
      const emailData = {
        redirect_to: `${window.location.origin}/auth/callback`
      };
      
      console.log("Email data being sent:", emailData);
      console.log("Current window origin:", window.location.origin);
      
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
        emailData: emailData,
        success: result?.success,
        messageId: result?.debug_info?.message_id,
        deliveryNotes: result?.debug_info?.delivery_notes,
        domainVerification: result?.debug_info?.domain_verification_reminder
      });
      
      if (result && result.success) {
        toast({
          title: "✅ Email sent successfully!",
          description: `A verification email has been sent to ${email}. Message ID: ${result.debug_info?.message_id || 'Unknown'}. Check Resend dashboard and your inbox.`,
        });
      } else {
        // Show warning if success is not explicitly true
        toast({
          variant: "destructive",
          title: "⚠️ Email send status unclear",
          description: `The email may have been sent to ${email}, but we couldn't confirm delivery. Check your inbox and spam folder.`,
        });
      }
    } catch (error: any) {
      console.error("=== EMAIL RESEND FAILED ===");
      console.error("Error resending email:", error);
      setDebugInfo({
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
        resendCount: resendCount + 1,
        email: email,
        failed: true
      });
      
      toast({
        variant: "destructive",
        title: "❌ Failed to send email",
        description: `Error: ${error.message || "Unknown error"}. Check the debug info below for details.`
      });
    } finally {
      setIsResending(false);
    }
  };

  const getDomainStatusIcon = () => {
    switch (domainVerificationStatus) {
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unverified':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDomainStatusMessage = () => {
    switch (domainVerificationStatus) {
      case 'checking':
        return 'Checking domain verification status...';
      case 'verified':
        return 'Domain verification confirmed - Emails should be delivered';
      case 'unverified':
        return 'Domain may need verification - Check Resend dashboard';
      case 'error':
        return 'Unable to verify domain status - Check Resend configuration';
      default:
        return 'Domain status unknown';
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
              {/* Domain Verification Status */}
              <div className={`p-4 rounded-md border ${
                domainVerificationStatus === 'verified' ? 'bg-green-50 border-green-200' :
                domainVerificationStatus === 'error' ? 'bg-red-50 border-red-200' :
                'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center">
                  {getDomainStatusIcon()}
                  <h3 className="ml-2 text-sm font-medium text-gray-800">Domain Status</h3>
                </div>
                <p className={`mt-1 text-sm ${
                  domainVerificationStatus === 'verified' ? 'text-green-700' :
                  domainVerificationStatus === 'error' ? 'text-red-700' :
                  'text-amber-700'
                }`}>
                  {getDomainStatusMessage()}
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="text-sm font-medium text-amber-800">Email Delivery Checklist</h3>
                </div>
                <div className="mt-2 text-sm text-amber-700 space-y-2">
                  <p>If you don't see the email within 5 minutes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Check your spam/junk folder</li>
                    <li>Add onboarding@resend.dev to your contacts</li>
                    <li>Try a different email provider (Gmail, ProtonMail, etc.)</li>
                    <li>Check if your email provider blocks automated emails</li>
                    <li>Look for emails from "Tennexis" or "onboarding@resend.dev"</li>
                    <li><strong>Check Resend dashboard for delivery status</strong></li>
                  </ul>
                </div>
              </div>
              
              {resendTestStatus && (
                <div className={`p-4 rounded-md ${
                  resendTestStatus.includes('❌') || resendTestStatus.includes('error') || resendTestStatus.includes('Error') || resendTestStatus.includes('failed') || resendTestStatus.includes('Failed') 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    resendTestStatus.includes('❌') || resendTestStatus.includes('error') || resendTestStatus.includes('Error') || resendTestStatus.includes('failed') || resendTestStatus.includes('Failed') 
                      ? 'text-red-700' 
                      : 'text-green-700'
                  }`}>
                    {resendTestStatus}
                  </p>
                  {(resendTestStatus.includes('❌') || resendTestStatus.includes('error') || resendTestStatus.includes('Error') || resendTestStatus.includes('failed') || resendTestStatus.includes('Failed')) && (
                    <div className="mt-2 text-xs text-red-500 space-y-1">
                      <p>🔧 Troubleshooting steps:</p>
                      <p>• Check RESEND_API_KEY is set in Supabase environment variables</p>
                      <p>• <strong>CRITICAL:</strong> Verify your domain at: 
                        <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:text-blue-800 inline-flex items-center">
                          resend.com/domains <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                      <p>• Ensure all DNS records show "Verified" status</p>
                      <p>• Update sender email to use your verified domain</p>
                      <p>• Redeploy the function after setting environment variables</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={testResendConfig}
                  variant="outline" 
                  size="sm"
                  disabled={isTestingResend}
                  className="flex-1"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isTestingResend ? 'animate-spin' : ''}`} />
                  {isTestingResend ? 'Testing...' : 'Test Connection'}
                </Button>
                
                <Button 
                  asChild
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                    Resend Dashboard <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-sm font-medium text-blue-800">🔍 Most Likely Issues</h3>
                <div className="mt-2 text-sm text-blue-700 space-y-2">
                  <div>
                    <p><strong>1. Domain Not Verified:</strong></p>
                    <p className="text-xs">Go to <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a> and ensure your domain shows "Verified"</p>
                  </div>
                  <div>
                    <p><strong>2. DNS Records Missing:</strong></p>
                    <p className="text-xs">Add SPF, DKIM records and wait for DNS propagation (up to 30 minutes)</p>
                  </div>
                  <div>
                    <p><strong>3. Sender Email Issues:</strong></p>
                    <p className="text-xs">Using onboarding@resend.dev - update to your verified domain for production</p>
                  </div>
                </div>
              </div>
              
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
                    {isResending ? 'Sending verification email...' : `Resend verification email ${resendCount > 0 ? `(#${resendCount + 1})` : ''}`}
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
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">
                    🔍 Debug Information (Attempt #{debugInfo.resendCount}):
                  </h4>
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>Email:</strong> {debugInfo.email}</div>
                      <div><strong>Success:</strong> {debugInfo.success ? '✅ Yes' : debugInfo.failed ? '❌ Failed' : '⚠️ Unknown'}</div>
                      <div><strong>Message ID:</strong> {debugInfo.messageId || 'None'}</div>
                      <div><strong>Timestamp:</strong> {new Date(debugInfo.timestamp).toLocaleString()}</div>
                    </div>
                    {debugInfo.domainVerification && (
                      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <strong className="text-yellow-800">Domain Verification Required:</strong>
                        <p className="text-yellow-700 text-xs mt-1">
                          Current: {debugInfo.domainVerification.current_sender}
                        </p>
                        <p className="text-yellow-700 text-xs">
                          Recommended: {debugInfo.domainVerification.recommended_sender}
                        </p>
                        <p className="text-yellow-700 text-xs">
                          Action: <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">Verify domain</a>
                        </p>
                      </div>
                    )}
                    {debugInfo.deliveryNotes && (
                      <div>
                        <strong>Delivery Notes:</strong>
                        <ul className="list-disc pl-4 mt-1">
                          {debugInfo.deliveryNotes.map((note: string, idx: number) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Full Response
                      </summary>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-60 mt-2 p-2 bg-white border rounded">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  </div>
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
