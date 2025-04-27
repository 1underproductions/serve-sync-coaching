
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
      
      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      
      // Call the edge function with authentication headers
      const response = await fetch(
        'https://cugwtwpgccpcjeumrkxf.supabase.co/functions/v1/file-upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk'
          },
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Upload error:", errorData || response.statusText);
        throw new Error(`Upload failed: ${response.status} ${errorData?.details || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Call the callback with the public URL
      onUploadComplete(data.url);
      
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
