
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  initialImage?: string | null;
  onImageChange: (image: string) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function ImageUploader({ 
  initialImage, 
  onImageChange, 
  isSubmitting = false,
  className 
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result);
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (image) {
      try {
        await onImageChange(image);
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
    }
  };

  const handleRemove = () => {
    setImage(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 mb-3 border-2 border-gray-200 hover:border-tennis-green-500 transition-colors group"
      >
        {image ? (
          <>
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url(${image})`,
                backgroundPosition: 'center',
                backgroundSize: `${zoom * 100}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/80 hover:bg-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" /> Change
              </Button>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 hover:text-tennis-green-500 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <PlusCircle className="h-12 w-12" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isSubmitting}
      />

      {image && (
        <div className="flex items-center space-x-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRemove}
            className="text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4 mr-2" /> Remove
          </Button>
          
          <Button 
            size="sm" 
            variant="tennis"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            Save Picture
          </Button>
        </div>
      )}
    </div>
  );
}
