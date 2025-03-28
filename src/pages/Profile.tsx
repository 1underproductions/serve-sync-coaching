
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Upload, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be at most 500 characters" }).optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  yearsExperience: z.coerce.number().min(0).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const PROFILE_IMAGE_KEY = 'serveSync.profileImage';
const PROFILE_DATA_KEY = 'serveSync.profileData';

const Profile = () => {
  const { toast } = useToast();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  // Load profile image from localStorage on component mount
  useEffect(() => {
    const savedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
    if (savedImage) {
      setAvatarSrc(savedImage);
    }
    
    // Load saved profile data if available
    const savedProfileData = localStorage.getItem(PROFILE_DATA_KEY);
    if (savedProfileData) {
      try {
        const parsedData = JSON.parse(savedProfileData);
        form.reset(parsedData);
      } catch (error) {
        console.error('Error parsing profile data from localStorage:', error);
      }
    }
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "Coach Smith",
      email: "coach@servesync.com",
      phone: "(555) 123-4567",
      bio: "Professional tennis coach with over 10 years of experience working with players of all levels.",
      location: "Los Angeles, CA",
      website: "https://www.mycoachingsite.com",
      yearsExperience: 10,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Save profile data to localStorage
    localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(data));
    
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    console.log("Profile data:", data);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarSrc(result);
        
        // Save image to localStorage
        localStorage.setItem(PROFILE_IMAGE_KEY, result);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });
    }
  };

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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                    name="name"
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
                          <Input placeholder="Your email" type="email" {...field} />
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
                      name="yearsExperience"
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
                    <Button type="submit" className="ml-auto" variant="tennis">
                      <Edit className="mr-2 h-4 w-4" />
                      Update Profile
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
