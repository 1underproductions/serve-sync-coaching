
import { useState, useEffect, useRef } from 'react';
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
import { supabase } from '@/lib/supabase';

export const ProfilePicture = () => {
  const { toast } = useToast();
  const { profile, user, fetchUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(profile?.avatar_url || null);

  // Always update avatar when profile changes
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarSrc(profile.avatar_url);
    }
  }, [profile]);

  // Refresh profile data when component mounts and when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

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
      
      // Use the security definer function to update avatar safely
      const { error: updateError } = await supabase.rpc('update_user_avatar_safe', {
        new_avatar_url: url
      });
        
      if (updateError) {
        console.error('Failed to update avatar URL using RPC function:', updateError);
        
        // Fallback to direct update
        const { error: directUpdateError } = await supabase
          .from('profiles')
          .update({ avatar_url: url })
          .eq('id', user.id);
          
        if (directUpdateError) throw directUpdateError;
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
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarSrc || ""} alt="Profile" />
            <AvatarFallback className="text-4xl bg-tennis-green-100 text-tennis-green-700">
              <User />
            </AvatarFallback>
          </Avatar>

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
