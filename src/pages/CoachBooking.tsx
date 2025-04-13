
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicBookingCalendar from '@/components/booking/PublicBookingCalendar';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CoachBooking = () => {
  const { coachId } = useParams();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!coachId) return;

      try {
        console.log('Attempting to fetch coach profile for ID:', coachId);
        
        // We'll specify a public API with a simpler query
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, bio, location, hourly_rate')
          .eq('id', coachId)
          .limit(1);  // We're not using single() to avoid error if no row found

        if (error) {
          console.error('Error in coach profile query:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No coach found with ID:', coachId);
          setError('Coach not found');
        } else {
          console.log('Coach profile retrieved successfully:', data[0]);
          setCoach({...data[0], id: coachId});
        }
      } catch (error: any) {
        console.error('Exception in fetchCoachProfile:', error);
        setError(error.message || 'Could not load coach information');
        
        toast({
          title: 'Error',
          description: 'Could not load coach information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoachProfile();
  }, [coachId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
        <div className="flex items-center justify-center mb-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-xl font-medium">Loading coach profile...</span>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Coach Not Found</CardTitle>
            <CardDescription>
              The coach profile you're looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The coach may have deactivated their booking page or the URL may be incorrect.</p>
            {error && <p className="mt-2 text-sm text-muted-foreground">Error: {error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 p-4">
      <div className="container max-w-5xl mx-auto space-y-8 py-8">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center gap-4 mb-4">
              {coach.avatar_url ? (
                <img 
                  src={coach.avatar_url} 
                  alt={coach.full_name} 
                  className="h-24 w-24 rounded-full border-4 border-background"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-background">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {coach.full_name?.charAt(0)}
                  </span>
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold">{coach.full_name || 'Tennis Coach'}</h1>
                <p className="text-muted-foreground">
                  {coach.location ? `${coach.location}` : 'Tennis Coach'}
                </p>
              </div>
            </div>
            
            {coach.bio && (
              <CardDescription className="text-base mt-4 mb-6">{coach.bio}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="border-t pt-6">
              <PublicBookingCalendar coachId={coachId!} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <footer className="mt-auto py-6 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Tennis Coach Booking System</p>
      </footer>
    </div>
  );
};

export default CoachBooking;
