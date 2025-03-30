
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

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image under 5MB.",
      });
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (result) {
          try {
            await onImageChange(result);
            toast({
              title: "Profile Picture Updated",
              description: "Your profile picture has been successfully saved.",
            });
            
            // Reset the file input to allow selecting the same image again
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } catch (error) {
            console.error('Failed to save image:', error);
            toast({
              variant: "destructive",
              title: "Upload Failed",
              description: "There was a problem uploading your image.",
            });
          }
        }
      };
      
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File Reading Failed",
          description: "There was a problem reading the selected file.",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in file upload process:', error);
      toast({
        variant: "destructive",
        title: "Upload Process Failed",
        description: "There was a problem with the upload process.",
      });
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
