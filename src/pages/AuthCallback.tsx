
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded, processing redirect...");
        
        // Check for error parameters first
        const params = new URLSearchParams(location.search);
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');
        const errorCode = params.get('error_code');
        
        if (errorParam) {
          console.error("Error in auth callback URL parameters:", {
            error: errorParam,
            errorCode,
            errorDescription
          });
          
          // Handle expired link specifically
          if (errorCode === 'otp_expired' || errorParam === 'access_denied') {
            setIsExpired(true);
            setError("Your verification link has expired. Please request a new one.");
            toast({
              variant: "destructive",
              title: "Link expired",
              description: "Your verification link has expired. Please request a new one."
            });
            return;
          }
          
          setError(errorDescription || errorParam);
          throw new Error(errorDescription || errorParam);
        }
        
        // If no error, look for the code parameter
        const code = params.get('code');
        
        if (!code) {
          throw new Error('Authorization code not found in URL parameters.');
        }
        
        console.log("Found authorization code, exchanging for session...");
        const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          console.error("Error processing auth callback:", sessionError);
          setError(sessionError.message || "Failed to verify your email");
          toast({
            variant: "destructive",
            title: "Authentication error",
            description: sessionError.message || "Failed to verify your email"
          });
          navigate('/login');
          return;
        }

        console.log("Session exchanged successfully:", data?.session);
        toast({
          title: "Email verified",
          description: "Your email has been verified successfully"
        });
        navigate('/dashboard');
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred during verification");
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: err instanceof Error ? err.message : "An unexpected error occurred during verification"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, location]);

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Show error state if verification failed
  if (!isProcessing && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600 text-center mb-6">{error}</p>
            
            {isExpired ? (
              <div className="space-y-4 w-full">
                <Button onClick={handleGoToLogin} className="w-full">
                  Request New Verification Email
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Please login again to request a new verification email
                </p>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <Button onClick={handleTryAgain} className="w-full flex items-center justify-center">
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
                <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state while processing
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
