
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageChange: (image: string) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function ImageUploader({ 
  onImageChange, 
  isSubmitting = false,
  className 
}: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      try {
        await onImageChange(result);
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been successfully saved.",
        });
      } catch (error) {
        console.error('Failed to save image:', error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was a problem uploading your image.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isSubmitting}
      />
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isSubmitting}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" /> 
        Add Image
      </Button>
    </div>
  );
}
