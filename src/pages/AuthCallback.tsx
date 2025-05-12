
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
        
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (!code) {
          throw new Error('Authorization code not found in URL parameters.');
        }
        
        console.log("Found authorization code, exchanging for session...");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Error processing auth callback:", error);
          toast({
            variant: "destructive",
            title: "Authentication error",
            description: error.message || "Failed to verify your email"
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
  }, [navigate, toast, location]);

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
