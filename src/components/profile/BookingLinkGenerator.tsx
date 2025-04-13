
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Copy, Share2, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

const BookingLinkGenerator = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [enableBooking, setEnableBooking] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  
  const bookingLink = user?.id 
    ? `${window.location.origin}/booking/${user.id}` 
    : '';

  // Verify the user exists in the profiles table
  useEffect(() => {
    const checkProfileExists = async () => {
      if (!user?.id) return;
      
      try {
        console.log('Checking if profile exists for booking link generation');
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .limit(1);
          
        if (error) {
          console.error('Error checking profile:', error);
          setIsAvailable(false);
          return;
        }
        
        setIsAvailable(data && data.length > 0);
        console.log('Profile availability for booking:', data && data.length > 0);
      } catch (err) {
        console.error('Failed to check profile availability:', err);
        setIsAvailable(false);
      }
    };
    
    checkProfileExists();
  }, [user?.id]);

  const handleCopyLink = () => {
    if (!bookingLink) return;
    
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    toast({
      title: 'Link copied',
      description: 'Booking link copied to clipboard',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    if (!bookingLink) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Book a Tennis Session',
        text: 'Book a tennis session with me',
        url: bookingLink,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      handleCopyLink();
    }
  };

  // In a real implementation, this would toggle the availability in the database
  const handleToggleBooking = (checked: boolean) => {
    setEnableBooking(checked);
    toast({
      title: checked ? 'Booking enabled' : 'Booking disabled',
      description: checked 
        ? 'Players can now book sessions through your public booking page' 
        : 'Your public booking page is now disabled',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Public Booking Link</CardTitle>
        <CardDescription>
          Share this link with players to let them book sessions directly on your calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="enable-booking" 
            checked={enableBooking}
            onCheckedChange={handleToggleBooking}
          />
          <Label htmlFor="enable-booking">Enable public bookings</Label>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="booking-link">Your booking link</Label>
          <div className="flex gap-2">
            <Input 
              id="booking-link"
              value={bookingLink}
              readOnly
              disabled={!enableBooking || !isAvailable}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              disabled={!enableBooking || !isAvailable}
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!enableBooking || !isAvailable}
              onClick={handleShareLink}
              className="shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          {!isAvailable && (
            <p className="text-sm text-amber-600 mt-2">
              Your profile needs to be completed before your booking link will be active.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingLinkGenerator;
