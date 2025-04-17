
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, parseISO, isAfter, isBefore, addMinutes, isSameDay } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, ChevronRight, Check } from 'lucide-react';

interface PublicBookingCalendarProps {
  coachId: string;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface Coach {
  full_name: string;
  hourly_rate: number;
  location: string;
  avatar_url?: string;
}

const PublicBookingCalendar = ({ coachId }: PublicBookingCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("60");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [coachInfo, setCoachInfo] = useState<Coach | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch coach info and existing sessions when date changes
  useEffect(() => {
    const fetchCoachInfoAndSessions = async () => {
      if (!date || !coachId) return;
      
      setIsLoading(true);
      try {
        // Fetch coach info
        const { data: coachData, error: coachError } = await supabase
          .from('profiles')
          .select('full_name, hourly_rate, location, avatar_url')
          .eq('id', coachId)
          .single();

        if (coachError) throw coachError;
        setCoachInfo(coachData);

        // Format date for query
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        // Fetch all sessions for the selected date
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('coach_id', coachId)
          .gte('start_time', `${formattedDate}T00:00:00`)
          .lt('start_time', `${format(addDays(date, 1), 'yyyy-MM-dd')}T00:00:00`);

        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);
        
        // Generate available time slots
        generateTimeSlots(sessionsData || []);
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

  // Helper function to generate time slots
  const generateTimeSlots = (existingSessions: any[]) => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8am
    const endHour = 20; // 8pm
    const now = new Date();
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStartTime = new Date(date!);
        slotStartTime.setHours(hour, minute, 0, 0);
        
        // Don't show past time slots for today
        if (format(date!, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && isBefore(slotStartTime, now)) {
          continue;
        }
        
        const slotEndTime = addMinutes(slotStartTime, 30);
        
        // Check if this slot overlaps with any existing session
        const isAvailable = !existingSessions?.some(session => {
          const sessionStart = parseISO(session.start_time);
          const sessionEnd = parseISO(session.end_time);
          
          return (
            (isAfter(slotStartTime, sessionStart) && isBefore(slotStartTime, sessionEnd)) ||
            (isAfter(slotEndTime, sessionStart) && isBefore(slotEndTime, sessionEnd)) ||
            (isBefore(slotStartTime, sessionStart) && isAfter(slotEndTime, sessionEnd))
          );
        });
        
        slots.push({
          start: format(slotStartTime, 'HH:mm'),
          end: format(slotEndTime, 'HH:mm'),
          available: isAvailable
        });
      }
    }
    
    setTimeSlots(slots);
  };

  // Combine adjacent time slots based on selected duration
  const combineTimeSlots = () => {
    const duration = parseInt(selectedDuration);
    const slotsNeeded = duration / 30;
    const combinedSlots: TimeSlot[] = [];
    
    for (let i = 0; i <= timeSlots.length - slotsNeeded; i++) {
      let allAvailable = true;
      
      // Check if consecutive slots are available
      for (let j = 0; j < slotsNeeded; j++) {
        if (!timeSlots[i + j].available) {
          allAvailable = false;
          break;
        }
      }
      
      if (allAvailable) {
        combinedSlots.push({
          start: timeSlots[i].start,
          end: timeSlots[i + slotsNeeded - 1].end,
          available: true
        });
      }
    }
    
    return combinedSlots;
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot || !date || !coachInfo) return;
    
    setLoadingSlot(selectedTimeSlot);
    
    try {
      // Extract start and end time
      const [startTime, endTime] = selectedTimeSlot.split(' - ');
      
      // Create date objects for the session
      const sessionDate = format(date, 'yyyy-MM-dd');
      const startDateTime = `${sessionDate}T${startTime}:00`;
      const endDateTime = `${sessionDate}T${endTime}:00`;
      
      // Calculate amount based on duration
      const durationMinutes = parseInt(selectedDuration);
      const hours = durationMinutes / 60;
      const amount = coachInfo.hourly_rate * hours;
      
      // Create a session in the database
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
          requires_prepayment: true
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      // Create a checkout session for payment
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

  const availableTimeSlots = combineTimeSlots();

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
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <Button
                      key={`${slot.start}-${slot.end}`}
                      variant={selectedTimeSlot === `${slot.start} - ${slot.end}` ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setSelectedTimeSlot(`${slot.start} - ${slot.end}`)}
                      disabled={!slot.available || loadingSlot === `${slot.start} - ${slot.end}`}
                    >
                      {loadingSlot === `${slot.start} - ${slot.end}` ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : selectedTimeSlot === `${slot.start} - ${slot.end}` ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : null}
                      {slot.start} - {slot.end}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedTimeSlot && (
          <div className="border rounded-lg p-4 bg-muted/30 mt-6">
            <h3 className="font-medium mb-2">Booking Summary</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date:</dt>
                <dd>{format(date!, 'EEEE, MMMM d, yyyy')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Time:</dt>
                <dd>{selectedTimeSlot}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration:</dt>
                <dd>{selectedDuration} minutes</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Coach:</dt>
                <dd>{coachInfo?.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location:</dt>
                <dd>{coachInfo?.location || 'Main Courts'}</dd>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <dt>Total:</dt>
                <dd>${((parseInt(selectedDuration) / 60) * (coachInfo?.hourly_rate || 0)).toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        )}
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
