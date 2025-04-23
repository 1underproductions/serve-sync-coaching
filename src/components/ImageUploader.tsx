
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/lib/supabase";  // Using the main supabase client

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  bucket?: string;  // Add bucket as an optional prop
  isSubmitting?: boolean;
  className?: string;
}

export function ImageUploader({ 
  onUploadComplete,
  bucket = 'avatars',  // Default bucket if none specified
  isSubmitting = false,
  className 
}: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image under 5MB.",
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file.",
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      
      console.log(`Attempting to upload image to ${bucket} bucket...`);
      
      // First check if the bucket exists
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      console.log("Available buckets:", buckets);
      
      if (bucketError) {
        console.error("Error listing buckets:", bucketError);
        throw new Error(`Failed to check bucket: ${bucketError.message}`);
      }
      
      // Check if our bucket exists, create it if not (admins only)
      const bucketExists = buckets.some(b => b.name === bucket);
      if (!bucketExists) {
        console.log(`Bucket "${bucket}" doesn't exist, uploading to default "avatars" bucket instead`);
        // Fall back to avatars bucket
      }
      
      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase
        .storage
        .from(bucketExists ? bucket : 'avatars')
        .upload(filePath, file, {
          cacheControl: '3600'
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload: ${uploadError.message}`);
      }
      
      console.log("Upload successful, data:", data);
      
      // Get the public URL
      const { data: publicUrlData } = supabase
        .storage
        .from(bucketExists ? bucket : 'avatars')
        .getPublicUrl(filePath);
        
      const publicUrl = publicUrlData.publicUrl;
      console.log("Public URL:", publicUrl);
      
      // Call the callback with the public URL
      onUploadComplete(publicUrl);
      
      toast({
        title: "Upload Successful",
        description: "Image uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "There was a problem uploading your image.",
      });
      // Important: do NOT reset the form here
    } finally {
      setUploading(false);
      // Reset only the file input, not the entire form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isSubmitting || uploading}
      />
      <Button 
        variant="outline" 
        onClick={handleClick}
        disabled={isSubmitting || uploading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" /> 
        {uploading ? "Uploading..." : isSubmitting ? "Uploading..." : "Add Image"}
      </Button>
    </div>
  );
}
