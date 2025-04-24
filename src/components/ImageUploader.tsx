
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  bucket?: string;
  isSubmitting?: boolean;
  className?: string;
}

export function ImageUploader({ 
  onUploadComplete,
  bucket = 'avatars',
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

    // Check file size (limit to 5MB for avatars, 10MB for blog images)
    const maxSize = bucket === 'avatars' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `Please select an image under ${maxSize / (1024 * 1024)}MB.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select an image file.",
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      
      console.log(`Uploading file to ${bucket} bucket...`);
      
      // Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase
        .storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message);
      }
      
      console.log("File uploaded successfully:", data);
      
      // Get the public URL
      const { data: publicUrlData } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(filePath);
        
      console.log("Public URL:", publicUrlData.publicUrl);
      
      // Call the callback with the public URL
      onUploadComplete(publicUrlData.publicUrl);
      
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
    } finally {
      setUploading(false);
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
