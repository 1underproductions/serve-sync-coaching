
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback page loaded, processing redirect...");

        // Get the current URL to extract the auth code
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

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

        console.log("Session exchanged:", data?.session);
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
          description: "An unexpected error occurred during verification"
        });
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

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
