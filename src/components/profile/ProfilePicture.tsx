
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ImageUploader } from "@/components/ImageUploader";
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
  const { profile, user, updateProfile, fetchUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  
  // Pre-declare originalAvatar before the upload function
  const originalAvatar = profile?.avatar_url || null;

  // Update avatar whenever profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      console.log("Profile picture component - setting avatar from profile:", profile.avatar_url);
      setAvatarSrc(profile.avatar_url);
    } else {
      console.log("Profile has no avatar URL");
      setAvatarSrc(null);
    }
  }, [profile]);

  const handleImageUpload = async (imageData: string) => {
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
      console.log("Starting profile picture update...");
      
      // Update local state immediately for better UX
      setAvatarSrc(imageData);
      
      // Update the profile with the new avatar
      await updateProfile({ avatar_url: imageData });
      
      console.log("Profile picture updated successfully");
      
      // Make sure we have the latest profile data
      if (user.id) {
        await fetchUserProfile(user.id);
        console.log("Profile refreshed after avatar update");
      }
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      
      // Revert to previous avatar if update fails
      setAvatarSrc(originalAvatar);
      
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
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarSrc || ""} alt="Profile" />
            <AvatarFallback className="text-4xl bg-tennis-green-100 text-tennis-green-700">
              <User />
            </AvatarFallback>
          </Avatar>

          <ImageUploader 
            onImageChange={handleImageUpload}
            isSubmitting={isSubmitting}
            className="mt-4 w-full max-w-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
};

