
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

  // Always update avatar when profile changes
  useEffect(() => {
    console.log('ProfilePicture: profile changed:', profile);
    if (profile?.avatar_url) {
      console.log('ProfilePicture: Setting avatar URL:', profile.avatar_url);
      // Add a small delay to ensure the URL is valid and test if it loads
      const testImg = new Image();
      testImg.onload = () => {
        console.log('ProfilePicture: Image URL is valid and loads');
        setAvatarSrc(profile.avatar_url);
      };
      testImg.onerror = () => {
        console.error('ProfilePicture: Image URL failed to load:', profile.avatar_url);
        setAvatarSrc(null);
      };
      testImg.src = profile.avatar_url;
    } else {
      console.log('ProfilePicture: No avatar URL in profile');
      setAvatarSrc(null);
    }
  }, [profile]);

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
      
      // First update the local UI
      setAvatarSrc(url);
      
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
      
      // Refresh profile data
      await fetchUserProfile(user.id);
      
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
          <div className="relative">
            {/* Test with direct img tag first */}
            {avatarSrc ? (
              <div className="relative">
                <img 
                  src={avatarSrc}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
                  onLoad={() => console.log('Direct img loaded successfully:', avatarSrc)}
                  onError={(e) => {
                    console.log('Direct img failed to load:', avatarSrc);
                    console.log('Error event:', e);
                  }}
                />
                <div className="text-xs text-gray-500 mt-1 text-center break-all max-w-32">
                  Direct IMG: {avatarSrc}
                </div>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-tennis-green-100 text-tennis-green-700 flex items-center justify-center text-4xl">
                <User />
              </div>
            )}
            
            {/* Original Avatar component for comparison */}
            <Avatar className="h-32 w-32 mt-4">
              <AvatarImage 
                src={avatarSrc || ""} 
                alt="Profile" 
                onLoad={() => console.log('Avatar component loaded successfully:', avatarSrc)}
                onError={() => console.log('Avatar component failed to load:', avatarSrc)}
              />
              <AvatarFallback className="text-4xl bg-tennis-green-100 text-tennis-green-700">
                <User />
              </AvatarFallback>
            </Avatar>
            {avatarSrc && (
              <div className="text-xs text-gray-500 mt-1 text-center break-all max-w-32">
                Avatar component: {avatarSrc}
              </div>
            )}
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
