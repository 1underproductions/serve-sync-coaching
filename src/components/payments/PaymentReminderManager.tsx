
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, AlertCircle } from "lucide-react";

interface PaymentReminderProps {
  paymentLinkId: string;
  sessionDetails?: string;
  playerEmail?: string;
  expiresAt?: string;
}

const PaymentReminderManager = ({ paymentLinkId, sessionDetails, playerEmail, expiresAt }: PaymentReminderProps) => {
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (expiresAt) {
      const updateTimeLeft = () => {
        const now = new Date();
        const expiration = new Date(expiresAt);
        const diffMs = expiration.getTime() - now.getTime();
        
        if (diffMs <= 0) {
          setTimeLeft("Expired");
          return;
        }
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m remaining`);
        } else {
          setTimeLeft(`${minutes}m remaining`);
        }
      };
      
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  const sendReminder = async () => {
    if (!playerEmail || !paymentLinkId) return;
    
    setIsSending(true);
    
    try {
      // First, get the payment link checkout URL
      const { data: urlData, error: urlError } = await supabase.functions.invoke("get-checkout-url", {
        body: { id: paymentLinkId }
      });
      
      if (urlError || !urlData?.url) {
        throw new Error(urlError?.message || "Failed to get payment URL");
      }
      
      // Send the reminder email
      const { error } = await supabase.functions.invoke("custom-email", {
        body: {
          type: "payment-reminder",
          email: playerEmail,
          data: {
            payment_url: urlData.url,
            coach_name: user?.user_metadata?.full_name || "Your coach",
            session_details: sessionDetails || "Tennis coaching session",
            amount: 0, // We should get this from the payment link, but for now we'll leave it as 0
            currency: "USD",
            expires_in_hours: expiresAt ? Math.round((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)) : 24
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Reminder sent",
        description: "Payment reminder has been sent to the player.",
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send payment reminder.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {timeLeft && (
        <div className="text-sm flex items-center gap-1">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-muted-foreground">{timeLeft}</span>
        </div>
      )}
      {playerEmail && (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={sendReminder}
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Reminder
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default PaymentReminderManager;
