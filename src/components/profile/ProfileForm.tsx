
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit, TestTube } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be at most 500 characters" }).optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  years_experience: z.coerce.number().min(0).optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  onProfileUpdate: (isComplete: boolean) => void;
}

export const ProfileForm = ({ onProfileUpdate }: ProfileFormProps) => {
  const { toast } = useToast();
  const { profile, updateProfile, user, fetchUserProfile, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      bio: "",
      location: "",
      website: "",
      years_experience: 0,
      hourly_rate: 0,
    },
  });

  // Reset form when profile data changes
  useEffect(() => {
    if (profile) {
      console.log('ProfileForm: Updating form with profile data:', profile);
      const formValues: ProfileFormValues = {
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        years_experience: profile.years_experience || 0,
        hourly_rate: profile.hourly_rate || 0,
      };
      
      // Use reset to properly update all form fields
      form.reset(formValues);
    }
  }, [profile, form]);

  const testConnection = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "No user found",
        description: "User authentication is required to test profile updates.",
      });
      return;
    }

    setIsTesting(true);
    console.log('=== TESTING PROFILE CONNECTION ===');
    console.log('Current user:', user);
    console.log('Current profile:', profile);

    try {
      // Test a simple profile update
      const testUpdate = {
        bio: `Test update at ${new Date().toISOString()}`
      };
      
      console.log('Testing profile update with:', testUpdate);
      await updateProfile(testUpdate);
      
      toast({
        title: "Test successful!",
        description: "Profile connection is working properly.",
      });
      
      // Refresh the profile to see the change
      setTimeout(() => {
        fetchUserProfile(user.id);
      }, 1000);
    } catch (error) {
      console.error('Test connection error:', error);
      toast({
        variant: "destructive",
        title: "Test failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to update your profile.",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('=== PROFILE FORM SUBMISSION ===');
    console.log('Form data:', data);
    console.log('Current user ID:', user.id);
    
    try {
      await updateProfile(data);
      
      console.log('Profile update successful');
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Check if profile is complete
      const isProfileComplete = Boolean(data.bio && data.location && data.phone && data.years_experience);
      console.log('Profile complete status:', isProfileComplete);
      onProfileUpdate(isProfileComplete);
      
      // Refresh the profile data
      setTimeout(() => {
        console.log('Refreshing profile data...');
        fetchUserProfile(user.id);
      }, 500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: `There was a problem updating your profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Update your account information here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Test Profile Connection</p>
              <p className="text-xs text-gray-600">Click to test if profile updates are working</p>
            </div>
            <Button 
              onClick={testConnection}
              disabled={isTesting || !user}
              variant="outline"
              size="sm"
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTesting ? "Testing..." : "Test"}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your email" 
                      type="email" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your phone number" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="City, State" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell players about yourself" 
                      rows={4} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://..." 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="years_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="hourly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate ($)</FormLabel>
                  <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...field}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit" 
                className="ml-auto" 
                variant="tennis"
                disabled={isSubmitting || isLoading}
              >
                <Edit className="mr-2 h-4 w-4" />
                {isSubmitting ? "Updating..." : "Update Profile"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
