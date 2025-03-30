
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
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (result) {
          try {
            await onImageChange(result);
          } catch (error) {
            // Error is handled by the parent component
            console.error('Error in parent component during image upload:', error);
          } finally {
            // Reset the file input to allow selecting the same file again
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        }
      };
      
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Reading Failed",
          description: "There was a problem reading the selected file.",
        });
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in file upload process:', error);
      toast({
        variant: "destructive",
        title: "Upload Process Failed",
        description: "There was a problem with the upload process.",
      });
      
      // Reset the file input
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
        disabled={isSubmitting}
      />
      <Button 
        variant="outline" 
        onClick={handleClick}
        disabled={isSubmitting}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" /> 
        {isSubmitting ? "Uploading..." : "Add Image"}
      </Button>
    </div>
  );
}
