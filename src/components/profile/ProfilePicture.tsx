
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

  const handleImageUpload = async (file: File) => {
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
      
      // Use a simpler file path structure - always use the same filename to overwrite previous uploads
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      
      // Create bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('profile-images');
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('profile-images', { public: true });
      }
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded image
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
        
      if (!data || !data.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }
      
      // First update the local UI
      setAvatarSrc(data.publicUrl);
      
      // Use the security definer function to update avatar safely
      const { error: updateError } = await supabase.rpc('update_user_avatar_safe', {
        new_avatar_url: data.publicUrl
      });
        
      if (updateError) {
        console.error('Failed to update avatar URL using RPC function:', updateError);
        
        // Fallback to direct update
        const { error: directUpdateError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
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
            onImageChange={handleImageUpload}
            isSubmitting={isSubmitting}
            className="mt-4 w-full max-w-xs"
          />
        </div>
      </CardContent>
    </Card>
  );
};
