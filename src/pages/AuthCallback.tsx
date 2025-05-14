
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
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
        
        // Handle errors
        if (error) {
          console.error("Error in auth callback parameters:", {
            error,
            errorCode,
            errorDescription
          });
          
          // Handle expired link specifically
          if (errorCode === 'otp_expired' || error === 'access_denied') {
            toast({
              variant: "destructive",
              title: "Link expired",
              description: "Your verification link has expired. Please request a new one."
            });
            navigate('/login');
            return;
          }
          
          throw new Error(errorDescription || error);
        }
        
        // If no error and no code, try to see if we have a hash with a type parameter
        if (!code && location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const type = hashParams.get('type');
          
          if (type === 'recovery' || type === 'signup') {
            // This is likely a Supabase magic link flow
            console.log("Processing Supabase magic link flow:", type);
            // Let Supabase handle it via its internal processes
            // The URL fragment will be processed by Supabase's auto-detection
            return;
          }
        }
        
        // If no code at this point, check if we're on the /verify route with no params
        // which might be due to a Supabase internal redirect
        if (!code && location.pathname === '/verify') {
          console.log("On /verify path with no code, possibly from Supabase redirect");
          // Let Supabase internal detection handle it or show friendly message
          setTimeout(() => {
            if (isProcessing) {
              // If still processing after 3 seconds, show helpful message
              toast({
                title: "Verification in progress",
                description: "If you're not redirected soon, you may need to return to login and request a new verification link."
              });
              navigate('/login');
            }
          }, 3000);
          return;
        }
        
        // If we have a code, exchange it for session
        if (code) {
          console.log("Found authorization code, exchanging for session...");
          try {
            const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

            if (sessionError) {
              console.error("Error processing auth callback:", sessionError);
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
          } catch (exchangeError) {
            console.error("Exception during code exchange:", exchangeError);
            toast({
              variant: "destructive",
              title: "Authentication error",
              description: "Error during verification. Please try again or request a new link."
            });
            navigate('/login');
          }
          return;
        }
        
        // If we get here, we don't have what we need
        throw new Error('Authorization code not found in URL parameters.');
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: err instanceof Error ? err.message : "An unexpected error occurred during verification"
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, location, isProcessing]);

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
