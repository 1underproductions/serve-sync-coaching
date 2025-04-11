
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

const hourlyRateSchema = z.object({
  hourlyRate: z.coerce.number().min(10, { message: "Hourly rate must be at least $10" }),
});

type HourlyRateFormValues = z.infer<typeof hourlyRateSchema>;

export const HourlyRateForm = () => {
  const { toast } = useToast();
  const { profile, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hourlyRateForm = useForm<HourlyRateFormValues>({
    resolver: zodResolver(hourlyRateSchema),
    defaultValues: {
      hourlyRate: profile?.hourly_rate || 50,
    },
  });

  // Update the form when profile changes (e.g., after initial load)
  useEffect(() => {
    if (profile?.hourly_rate) {
      hourlyRateForm.setValue('hourlyRate', profile.hourly_rate);
    }
  }, [profile, hourlyRateForm]);

  const onHourlyRateSubmit = async (data: HourlyRateFormValues) => {
    try {
      setIsSubmitting(true);
      await updateProfile({ hourly_rate: data.hourlyRate });
      
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
