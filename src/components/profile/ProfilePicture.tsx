
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ImageUploader } from "@/components/ImageUploader";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const ProfilePicture = () => {
  const { toast } = useToast();
  const { profile, user, fetchUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());

  // Sync avatar when profile updates
  useEffect(() => {
    if (profile?.avatar_url) {
      console.log('ProfilePicture: Setting avatar from profile:', profile.avatar_url);
      setAvatarSrc(profile.avatar_url);
      setCacheBuster(Date.now());
    } else {
      console.log('ProfilePicture: No avatar_url in profile, clearing avatar');
      setAvatarSrc(null);
    }
  }, [profile?.avatar_url]);

  // Refresh profile data when component mounts and when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  // Debug logging
  useEffect(() => {
    console.log('ProfilePicture render state:', {
      profile: profile,
      avatarSrc: avatarSrc,
      profileAvatarUrl: profile?.avatar_url
    });
  }, [profile, avatarSrc]);

  const handleImageUpload = async (url: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to update your profile picture.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log("Starting profile picture update with URL:", url);
      
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      // Call the update-avatar edge function which bypasses RLS
      const response = await fetch(
        'https://cugwtwpgccpcjeumrkxf.supabase.co/functions/v1/update-avatar',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            avatarUrl: url
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Profile update error:", errorText);
        throw new Error(`Update failed: ${response.status} ${response.statusText}`);
      }
      
      console.log("Profile picture updated in database, refreshing profile...");
      
      // Wait a moment for database replication
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Refresh profile data
      const updatedProfile = await fetchUserProfile(user.id);
      
      console.log("Profile refreshed, new avatar_url:", updatedProfile?.avatar_url);
      
      // Verify the update worked
      if (updatedProfile?.avatar_url !== url) {
        console.warn('Profile avatar_url mismatch:', { expected: url, actual: updatedProfile?.avatar_url });
      }
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "There was a problem updating your profile picture. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture to make your profile more personalized.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="space-y-4 flex flex-col items-center">
            <div className="relative flex flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={avatarSrc ? `${avatarSrc}${avatarSrc.includes('?') ? '&' : '?'}v=${cacheBuster}` : ""} 
                  alt="Profile picture" 
                  onError={(e) => {
                    console.error('Avatar image failed to load:', avatarSrc);
                    // Don't clear on error - keep trying to show the image
                  }}
                />
                <AvatarFallback className="text-4xl bg-tennis-green-100 text-tennis-green-700">
                  <User />
                </AvatarFallback>
              </Avatar>
            </div>

          <ImageUploader 
            onUploadComplete={handleImageUpload}
            isSubmitting={isSubmitting}
            className="mt-4 w-full max-w-xs"
            bucket="avatars"
          />
        </div>
      </CardContent>
    </Card>
  );
};
