
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, ZoomIn, ZoomOut, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  const [isPinching, setIsPinching] = useState(false);
  const [initialDistance, setInitialDistance] = useState(0);
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
    if (!image) return;
    
    // Handle pinch zoom with two fingers
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      
      const dist = getDistanceBetweenTouches(e);
      setInitialDistance(dist);
    } 
    // Handle drag with one finger
    else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const getDistanceBetweenTouches = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
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
    if (isPinching && e.touches.length === 2) {
      e.preventDefault();
      
      // Calculate new distance between touches
      const newDistance = getDistanceBetweenTouches(e);
      
      // Calculate zoom factor based on the distance change
      const zoomFactor = newDistance / initialDistance;
      const newZoom = Math.max(0.5, Math.min(3, zoom * zoomFactor));
      
      if (Math.abs(newZoom - zoom) > 0.01) {
        setZoom(newZoom);
        setInitialDistance(newDistance);
      }
    } 
    else if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPinching(false);
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div 
        ref={imageContainerRef}
        className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 mb-3 border border-gray-200"
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
        <div className="flex items-center space-x-2 mb-3">
          <Button
            type="button"
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            className="p-0 h-8 w-8 rounded-full"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            className="p-0 h-8 w-8 rounded-full"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <span className="text-xs text-gray-500">
            {isPinching ? "Pinch to zoom" : "Drag to position"}
          </span>
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isSubmitting}
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? "Change Image" : "Select Image"}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
        </Button>

        {image && (
          <Button
            size="sm"
            variant="tennis"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
}
