
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const hourlyRateSchema = z.object({
  hourlyRate: z.coerce.number().min(10, { message: "Hourly rate must be at least $10" }),
});

type HourlyRateFormValues = z.infer<typeof hourlyRateSchema>;

export const HourlyRateForm = () => {
  const { toast } = useToast();
  const { profile, updateProfile, fetchUserProfile, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hourlyRateForm = useForm<HourlyRateFormValues>({
    resolver: zodResolver(hourlyRateSchema),
    defaultValues: {
      hourlyRate: profile?.hourly_rate ? Number(profile.hourly_rate) : 50,
    },
  });

  // Update the form when profile changes (e.g., after initial load)
  useEffect(() => {
    if (profile?.hourly_rate !== undefined && profile?.hourly_rate !== null) {
      console.log('HourlyRateForm: Setting form value from profile:', profile.hourly_rate);
      hourlyRateForm.setValue('hourlyRate', Number(profile.hourly_rate));
    } else {
      console.log('HourlyRateForm: No hourly rate in profile or profile not loaded yet:', profile);
    }
  }, [profile, hourlyRateForm]);

  const onHourlyRateSubmit = async (data: HourlyRateFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!user?.id) {
        console.error('Cannot update hourly rate: No user ID available');
        toast({
          title: "Error",
          description: "You must be logged in to update your hourly rate.",
          variant: "destructive",
        });
        return;
      }
      
      // Log the data we're about to send for debugging
      console.log('Updating hourly rate with data:', { hourly_rate: data.hourlyRate });
      
      // Direct database operation for reliability
      const { error } = await supabase
        .from('profiles')
        .update({ hourly_rate: data.hourlyRate })
        .eq('id', user.id);
        
      if (error) {
        console.error('Direct Supabase update error:', error);
        throw error;
      }
      
      console.log('Profile hourly rate updated successfully in database');
      
      // Now refresh the profile
      const refreshedProfile = await fetchUserProfile();
      console.log('Profile refreshed after update:', refreshedProfile);
      
      toast({
        title: "Hourly Rate Updated",
        description: `Your hourly rate is now set to $${data.hourlyRate}/hour.`,
      });
    } catch (error) {
      console.error('Error updating hourly rate:', error);
      toast({
        title: "Error",
        description: "Could not update hourly rate. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...hourlyRateForm}>
      <form onSubmit={hourlyRateForm.handleSubmit(onHourlyRateSubmit)} className="space-y-4">
        <FormField
          control={hourlyRateForm.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="10" 
                  step="1" 
                  placeholder="Enter your hourly coaching rate" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Set the standard hourly rate for your coaching sessions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          variant="tennis" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Hourly Rate
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};
