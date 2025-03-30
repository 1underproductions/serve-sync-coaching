
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialImage !== undefined) {
      setImage(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      // Don't call onImageChange here, wait for user to complete adjustments
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (image) {
      try {
        await onImageChange(image);
      } catch (error) {
        console.error('Failed to save image:', error);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!image || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        ref={imageContainerRef}
        className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 mb-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {image ? (
          <div
            className="h-full w-full cursor-move"
            style={{
              backgroundImage: `url(${image})`,
              backgroundPosition: 'center',
              backgroundSize: `${zoom * 100}%`,
              backgroundRepeat: 'no-repeat',
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <PlusCircle className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {image && (
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          <div className="flex items-center text-sm text-gray-500">
            <Move className="h-4 w-4 mr-1" /> Drag to position
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <label 
          className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          {image ? "Choose a different image" : "Select image"}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
        </label>

        {image && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-tennis-green-600 text-primary-foreground hover:bg-tennis-green-700 h-10 px-4 py-2"
          >
            {isSubmitting ? "Saving..." : "Save Image"}
          </button>
        )}
      </div>
    </div>
  );
}
