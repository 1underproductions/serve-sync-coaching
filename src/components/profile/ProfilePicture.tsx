
import { useState } from 'react';
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
import { supabase } from "@/lib/supabase";

export const ProfilePicture = () => {
  const { toast } = useToast();
  const { profile, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use a separate state for the avatar to avoid UI flicker during updates
  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    profile?.avatar_url || null
  );

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
      
      // Instead of using the updateProfile method from AuthContext,
      // directly update the profiles table to avoid the infinite recursion error
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageData })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      console.log("Profile picture updated successfully");
      
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      
      // Revert to previous avatar if update fails
      setAvatarSrc(profile?.avatar_url || null);
      
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
