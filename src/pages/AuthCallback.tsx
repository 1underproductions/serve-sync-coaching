
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorInfo, setErrorInfo] = useState<{
    title: string;
    message: string;
    showRequestNew: boolean;
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded, processing redirect...");
        console.log("Current location:", location.pathname, location.search, location.hash);
        
        // Check for error parameters first - in either search params or hash
        let error, errorDescription, errorCode, code;
        const params = new URLSearchParams(location.search);
        
        // Get error info from search params
        error = params.get('error');
        errorDescription = params.get('error_description');
        errorCode = params.get('error_code');
        code = params.get('code');
        
        // If no error info in search params, try to get from hash (common in OAuth flows)
        if (!error && location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          error = error || hashParams.get('error');
          errorDescription = errorDescription || hashParams.get('error_description');
          errorCode = errorCode || hashParams.get('error_code'); 
          code = code || hashParams.get('code');
        }
        
        // Handle specific errors
        if (error || errorCode) {
          console.error("Error in auth callback parameters:", {
            error,
            errorCode,
            errorDescription
          });
          
          // Handle expired link specifically
          if (errorCode === 'otp_expired' || error === 'access_denied') {
            setErrorInfo({
              title: "Email verification link has expired",
              message: "The verification link you clicked is no longer valid. Please request a new verification email.",
              showRequestNew: true
            });
            setIsProcessing(false);
            return;
          }
          
          // Handle other errors
          setErrorInfo({
            title: "Authentication error",
            message: errorDescription || "There was a problem verifying your email. Please try again or contact support.",
            showRequestNew: true
          });
          setIsProcessing(false);
          return;
        }
        
        // If no error and no code, try to see if we have a hash with a type parameter
        if (!code && location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const type = hashParams.get('type');
          
          if (type === 'recovery' || type === 'signup') {
            // This is likely a Supabase magic link flow - let Supabase handle it
            console.log("Processing Supabase magic link flow:", type);
            
            // Wait a bit for Supabase's auto-handling
            setTimeout(() => {
              if (isProcessing) {
                toast({
                  title: "Verification in progress",
                  description: "If you're not redirected soon, please try logging in."
                });
                navigate('/login');
              }
            }, 5000);
            return;
          }
        }
        
        // Special case for /verify path with no parameters
        if (location.pathname === '/verify' && !code && !error) {
          console.log("On /verify path with no code, possibly from Supabase redirect");
          
          // Let Supabase internal detection handle it or show friendly message after a delay
          setTimeout(() => {
            if (isProcessing) {
              setErrorInfo({
                title: "Verification link issue",
                message: "There was a problem with your verification link. Please request a new one.",
                showRequestNew: true
              });
              setIsProcessing(false);
            }
          }, 4000);
          return;
        }
        
        // If we have a code, exchange it for session
        if (code) {
          console.log("Found authorization code, exchanging for session...");
          try {
            const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

            if (sessionError) {
              console.error("Error processing auth callback:", sessionError);
              setErrorInfo({
                title: "Verification failed",
                message: sessionError.message || "Failed to verify your email. Please try again.",
                showRequestNew: true
              });
              setIsProcessing(false);
              return;
            }

            console.log("Session exchanged successfully:", data?.session);
            toast({
              title: "Email verified",
              description: "Your email has been verified successfully"
            });
            navigate('/dashboard');
          } catch (exchangeError) {
            console.error("Exception during code exchange:", exchangeError);
            setErrorInfo({
              title: "Verification error",
              message: "Error during verification. Please try again or request a new link.",
              showRequestNew: true
            });
            setIsProcessing(false);
          }
          return;
        }
        
        // If we get here with no code and no error, something unexpected happened
        throw new Error('No authorization code or error found in URL parameters.');
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setErrorInfo({
          title: "Authentication error",
          message: err instanceof Error ? err.message : "An unexpected error occurred during verification",
          showRequestNew: true
        });
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, location, isProcessing]);

  const handleRequestNewLink = async () => {
    try {
      const email = localStorage.getItem('last_signup_email');
      if (!email) {
        toast({
          variant: "destructive",
          title: "Email not found",
          description: "Please go to the login page and sign in with your email"
        });
        navigate('/login');
        return;
      }

      // Use sendCustomEmail from supabase.ts
      const { sendCustomEmail } = await import('@/lib/supabase');
      await sendCustomEmail('confirmation', email, {
        redirect_to: `${window.location.origin}/auth/callback`,
      });
      
      toast({
        title: "Verification email sent",
        description: "We've sent a new verification email. Please check your inbox."
      });
      
      navigate('/email-confirmation');
    } catch (error: any) {
      console.error("Error requesting new verification link:", error);
      toast({
        variant: "destructive",
        title: "Failed to send verification email",
        description: error.message || "Please try signing in again"
      });
      navigate('/login');
    }
  };

  if (errorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{errorInfo.title}</h2>
            <p className="mt-2 text-gray-600 text-center mb-6">
              {errorInfo.message}
            </p>
            {errorInfo.showRequestNew && (
              <div className="flex flex-col space-y-4 w-full">
                <Button onClick={handleRequestNewLink} className="w-full">
                  Request new verification link
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Return to login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900">Verifying your email</h2>
          <p className="mt-2 text-gray-600 text-center">
            Please wait while we verify your authentication...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
