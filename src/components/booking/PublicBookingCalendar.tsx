
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addDays, format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { generateTimeSlots, combineTimeSlots } from '@/utils/booking/timeUtils';
import TimeSlotSelector from './TimeSlotSelector';
import BookingSummary from './BookingSummary';
import type { TimeSlot, Coach } from '@/types/booking';

interface PublicBookingCalendarProps {
  coachId: string;
}

// Session type for Supabase queries
interface SessionData {
  id: string;
  coach_id: string;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  title: string;
  [key: string]: any; // Allow other fields
}

const PublicBookingCalendar = ({ coachId }: PublicBookingCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("60");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [coachInfo, setCoachInfo] = useState<Coach | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoachInfoAndSessions = async () => {
      if (!date || !coachId) return;
      
      setIsLoading(true);
      try {
        const { data: coachData, error: coachError } = await supabase
          .from('profiles')
          .select('full_name, hourly_rate, location, avatar_url')
          .eq('id', coachId)
          .single();

        if (coachError) throw coachError;
        setCoachInfo(coachData);

        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Get regular (non-recurring) sessions for the selected date
        const { data: regularSessions, error: regularSessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('coach_id', coachId)
          .is('is_recurring', false)  // Changed from eq to is which is safer for boolean filters
          .gte('start_time', `${formattedDate}T00:00:00`)
          .lt('start_time', `${format(addDays(date, 1), 'yyyy-MM-dd')}T00:00:00`);

        if (regularSessionsError) throw regularSessionsError;

        // Get recurring sessions for this coach
        const { data: recurringSessionsData, error: recurringSessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('coach_id', coachId)
          .is('is_recurring', true);  // Changed from eq to is for safer boolean filtering
        
        if (recurringSessionsError) throw recurringSessionsError;
        
        // Combine both types of sessions
        const allSessions = [
          ...(regularSessions || []),
          ...(recurringSessionsData || [])
        ];
        
        setSessions(allSessions);
        
        const newTimeSlots = generateTimeSlots(date, allSessions);
        setTimeSlots(newTimeSlots);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Could not load availability',
          variant: 'destructive',
        });
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoachInfoAndSessions();
  }, [date, coachId]);

  const handleBooking = async () => {
    if (!selectedTimeSlot || !date || !coachInfo) return;
    
    setLoadingSlot(selectedTimeSlot);
    
    try {
      const [startTime, endTime] = selectedTimeSlot.split(' - ');
      const sessionDate = format(date, 'yyyy-MM-dd');
      const startDateTime = `${sessionDate}T${startTime}:00`;
      const endDateTime = `${sessionDate}T${endTime}:00`;
      
      const durationMinutes = parseInt(selectedDuration);
      const hours = durationMinutes / 60;
      const amount = coachInfo.hourly_rate * hours;
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          coach_id: coachId,
          title: `Tennis Session (${durationMinutes} minutes)`,
          description: 'Booked online',
          start_time: startDateTime,
          end_time: endDateTime,
          location: coachInfo.location || 'Main Courts',
          status: 'scheduled',
          payment_status: 'pending',
          requires_prepayment: true,
          is_recurring: false
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: `Tennis Session (${durationMinutes} minutes)`,
          currency: 'USD',
          sessionId: sessionData.id,
          successPath: '/booking-success',
          isDeposit: false,
          cancellationPolicy: '24_hours'
        })
      });
      
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: 'Booking Failed',
        description: 'An error occurred while booking your session',
        variant: 'destructive',
      });
    } finally {
      setLoadingSlot(null);
    }
  };

  const availableTimeSlots = combineTimeSlots(timeSlots, selectedDuration);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Book a Tennis Session with {coachInfo?.full_name}</CardTitle>
        <CardDescription>
          Select a date, time, and duration for your tennis coaching session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Select a Date</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Session Duration</h3>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes (${(coachInfo?.hourly_rate || 0) * 0.5})</SelectItem>
                  <SelectItem value="60">60 minutes (${coachInfo?.hourly_rate || 0})</SelectItem>
                  <SelectItem value="90">90 minutes (${(coachInfo?.hourly_rate || 0) * 1.5})</SelectItem>
                  <SelectItem value="120">120 minutes (${(coachInfo?.hourly_rate || 0) * 2})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Available Time Slots</h3>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading available times...</span>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No available time slots for this date.</p>
                </div>
              ) : (
                <TimeSlotSelector
                  timeSlots={availableTimeSlots}
                  selectedTimeSlot={selectedTimeSlot}
                  setSelectedTimeSlot={setSelectedTimeSlot}
                  loadingSlot={loadingSlot}
                />
              )}
            </div>
          </div>
        </div>

        <BookingSummary
          date={date!}
          selectedTimeSlot={selectedTimeSlot!}
          selectedDuration={selectedDuration}
          coachInfo={coachInfo}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleBooking}
          disabled={!selectedTimeSlot || loadingSlot !== null}
        >
          {loadingSlot ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Book & Pay Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PublicBookingCalendar;
