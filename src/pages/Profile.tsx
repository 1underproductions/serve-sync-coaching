import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Upload, Edit, Award, DollarSign, Info } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be at most 500 characters" }).optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  years_experience: z.coerce.number().min(0).optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const QUALIFICATIONS_KEY = 'tennexis.qualifications';
const COACHING_LEVEL_KEY = 'tennexis.coachingLevel';
const PACKAGES_KEY = 'tennexis.packages';

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [coachingLevel, setCoachingLevel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [showProfilePrompt, setShowProfilePrompt] = useState(true);

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
        hourly_rate: profile.hourly_rate || 0,
      });
      
      if (profile.avatar_url) {
        setAvatarSrc(profile.avatar_url);
      }
      
      const isProfileIncomplete = !profile.bio || !profile.location || !profile.phone || !profile.years_experience;
      setShowProfilePrompt(isProfileIncomplete);
    }
    
    const savedQualifications = localStorage.getItem(QUALIFICATIONS_KEY);
    if (savedQualifications) {
      try {
        setQualifications(JSON.parse(savedQualifications));
      } catch (error) {
        console.error('Error parsing qualifications from localStorage:', error);
        setQualifications([]);
      }
    } else {
      setQualifications([]);
    }

    const savedCoachingLevel = localStorage.getItem(COACHING_LEVEL_KEY);
    if (savedCoachingLevel) {
      setCoachingLevel(savedCoachingLevel);
    }
    
    const savedPackages = localStorage.getItem(PACKAGES_KEY);
    if (savedPackages) {
      try {
        setPackages(JSON.parse(savedPackages));
      } catch (error) {
        console.error('Error parsing packages from localStorage:', error);
        setPackages([]);
      }
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setShowProfilePrompt(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setAvatarSrc(result);
        
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

        {showProfilePrompt && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Complete your profile</AlertTitle>
            <AlertDescription className="text-blue-700">
              Welcome to Tennexis! Please take a moment to complete your profile information below. 
              A complete profile helps build trust with your players and increases booking opportunities.
            </AlertDescription>
          </Alert>
        )}

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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-tennis-green-600" />
                  Coaching Qualifications
                </CardTitle>
                <CardDescription>
                  Add your coaching levels and certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coachingLevel ? (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Primary Coaching Level</h3>
                    <Badge variant="custom" className="bg-tennis-green-700 text-white hover:bg-tennis-green-800">
                      {coachingLevel}
                    </Badge>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-700">
                      Set your primary coaching level in the Settings page
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Certifications & Qualifications</h3>
                  
                  {qualifications.length > 0 ? (
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
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-700">
                        You haven't added any qualifications yet. Add them in the Settings page.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/settings')}
                    className="text-tennis-green-700 border-tennis-green-200 hover:bg-tennis-green-50"
                  >
                    Manage Qualifications in Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-tennis-green-600" />
                  Pricing Information
                </CardTitle>
                <CardDescription>
                  Set your hourly rate and package offerings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Standard Hourly Rate</h3>
                  <div className="text-xl font-bold text-tennis-green-700">
                    ${form.watch('hourly_rate') || 0}/hour
                  </div>
                </div>
                
                {packages.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Package Offerings</h3>
                    <div className="space-y-3">
                      {packages.map((pkg, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-gray-500">{pkg.sessions} sessions</div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-medium text-tennis-green-700">${pkg.price}</span>
                            {pkg.discount > 0 && (
                              <Badge variant="custom" className="bg-tennis-blue-100 text-tennis-blue-800">
                                {pkg.discount}% off
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 mb-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-700">
                      You haven't created any packages yet. Set them up in the Settings page.
                    </p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/settings')}
                    className="text-tennis-green-700 border-tennis-green-200 hover:bg-tennis-green-50"
                  >
                    Manage Pricing in Settings
                  </Button>
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
                  
                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
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
