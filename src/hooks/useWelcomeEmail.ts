
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WelcomeEmailData {
  playerName: string;
  playerEmail?: string;
  isChild: boolean;
  parentName?: string;
  parentEmail?: string;
}

interface CoachData {
  name: string;
  email: string;
}

export const useWelcomeEmail = () => {
  const { toast } = useToast();

  const sendWelcomeEmail = async (playerData: WelcomeEmailData, coachData: CoachData) => {
    try {
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          playerName: playerData.playerName,
          playerEmail: playerData.playerEmail,
          coachName: coachData.name,
          coachEmail: coachData.email,
          isChild: playerData.isChild,
          parentName: playerData.parentName,
          parentEmail: playerData.parentEmail,
        }
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        toast({
          title: "Email Warning",
          description: "Welcome email could not be sent. Please contact the player directly.",
          variant: "destructive",
        });
        return false;
      } else {
        console.log('Welcome email sent successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      toast({
        title: "Email Error",
        description: "Failed to send welcome email. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { sendWelcomeEmail };
};
