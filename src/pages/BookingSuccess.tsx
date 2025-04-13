
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const stripeSessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!stripeSessionId) {
        setLoading(false);
        return;
      }

      try {
        // Query directly from supabase - no need to call an API
        const { data: paymentLink, error: paymentError } = await supabase
          .from('payment_links')
          .select('*')
          .eq('stripe_checkout_id', stripeSessionId)
          .single();

        if (paymentError) {
          console.error('Error fetching payment link:', paymentError);
          setLoading(false);
          return;
        }
        
        // If there's no session_id, we can't fetch session details
        if (!paymentLink?.session_id) {
          setLoading(false);
          return;
        }

        // Now get the session details using a direct Supabase query
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select(`
            *,
            coach:coach_id (
              full_name, 
              avatar_url, 
              email, 
              phone
            )
          `)
          .eq('id', paymentLink.session_id)
          .single();

        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setLoading(false);
          return;
        }
        
        // Update the session payment status to paid
        await supabase
          .from('sessions')
          .update({ payment_status: 'paid' })
          .eq('id', paymentLink.session_id);

        setSession(sessionData);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        toast({
          title: 'Error',
          description: 'Could not load booking details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [stripeSessionId]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-3xl py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded w-full mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription className="text-center">
              Your tennis session has been successfully booked and payment processed.
            </CardDescription>
          </CardHeader>
          
          {session ? (
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium mb-4 text-lg">Session Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{format(parseISO(session.start_time), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {format(parseISO(session.start_time), 'h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Coach</h4>
                  <div className="flex items-center">
                    {session.coach?.avatar_url ? (
                      <img 
                        src={session.coach.avatar_url} 
                        alt={session.coach.full_name} 
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                    )}
                    <div>
                      <p className="font-medium">{session.coach?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{session.coach?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <h3 className="font-medium mb-2 text-amber-900">Cancellation Policy</h3>
                <p className="text-sm text-amber-800">
                  You may cancel up to 24 hours before the session for a full refund. 
                  Cancellations within 24 hours of the session will not be refunded.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-center text-muted-foreground">
                Your booking was successful, but we couldn't load the session details.
              </p>
            </CardContent>
          )}
          
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/schedule">View My Schedule</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default BookingSuccess;
