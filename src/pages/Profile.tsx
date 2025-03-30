
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Upload, Edit, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be at most 500 characters" }).optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  years_experience: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const QUALIFICATIONS_KEY = 'serveSync.qualifications';
const COACHING_LEVEL_KEY = 'serveSync.coachingLevel';

const Profile = () => {
  const { toast } = useToast();
  const { profile, updateProfile, isLoading } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [coachingLevel, setCoachingLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        years_experience: profile.years_experience || 0,
      });
      
      if (profile.avatar_url) {
        setAvatarSrc(profile.avatar_url);
      }
    }
    
    // Load qualifications
    const savedQualifications = localStorage.getItem(QUALIFICATIONS_KEY);
    if (savedQualifications) {
      try {
        setQualifications(JSON.parse(savedQualifications));
      } catch (error) {
        console.error('Error parsing qualifications from localStorage:', error);
        setQualifications(["LTA Level 3", "First Aid Certified", "Safeguarding Trained"]);
      }
    } else {
      // Default qualifications if none are saved
      setQualifications(["LTA Level 3", "First Aid Certified", "Safeguarding Trained"]);
    }

    // Load coaching level
    const savedCoachingLevel = localStorage.getItem(COACHING_LEVEL_KEY);
    if (savedCoachingLevel) {
      setCoachingLevel(savedCoachingLevel);
    } else {
      // Default coaching level if none is saved
      setCoachingLevel("LTA Level 3");
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      
      // For now, we'll use the FileReader API to display the image locally
      // In a production app, you would upload this to Supabase Storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setAvatarSrc(result);
        
        // In a real implementation, we would upload to Supabase Storage here
        // and then update the profile with the avatar_url

        // For now we'll update the profile with just a placeholder
        if (profile) {
          await updateProfile({ 
            avatar_url: result 
          });
        }
        
        toast({
          title: "Profile image updated",
          description: "Your profile image has been successfully updated.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your image.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and how it's displayed to players.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload a profile picture to make your profile more personalized.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="space-y-4 flex flex-col items-center">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarSrc || ""} alt="Profile" />
                    <AvatarFallback className="text-4xl bg-tennis-green-100 text-tennis-green-700">
                      <User />
                    </AvatarFallback>
                  </Avatar>

                  <div className="mt-4">
                    <label htmlFor="avatar-upload">
                      <div className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload new image
                      </div>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-tennis-green-600" />
                  Coaching Qualifications
                </CardTitle>
                <CardDescription>
                  Your coaching levels and certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coachingLevel && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Primary Coaching Level</h3>
                    <Badge variant="custom" className="bg-tennis-green-700 text-white hover:bg-tennis-green-800">
                      {coachingLevel}
                    </Badge>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Certifications & Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {qualifications.map((qual, index) => (
                      <Badge 
                        key={index} 
                        variant="custom" 
                        className="bg-tennis-green-100 text-tennis-green-800"
                      >
                        {qual}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Manage your qualifications in Settings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account information here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                          <Input placeholder="Your email" type="email" {...field} disabled />
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
                          <Input placeholder="Your phone number" {...field} />
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
                          <Input placeholder="City, State" {...field} />
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
                          <Textarea placeholder="Tell players about yourself" rows={4} {...field} />
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
                            <Input placeholder="https://..." {...field} />
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
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <CardFooter className="px-0 pt-4">
                    <Button 
                      type="submit" 
                      className="ml-auto" 
                      variant="tennis"
                      disabled={isSubmitting}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
