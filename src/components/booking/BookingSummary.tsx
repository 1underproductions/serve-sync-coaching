
import { format } from 'date-fns';
import type { BookingSummaryProps } from '@/types/booking';

const BookingSummary = ({ date, selectedTimeSlot, selectedDuration, coachInfo }: BookingSummaryProps) => {
  if (!selectedTimeSlot) return null;

  return (
    <div className="border rounded-lg p-4 bg-muted/30 mt-6">
      <h3 className="font-medium mb-2">Booking Summary</h3>
      <dl className="space-y-2">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Date:</dt>
          <dd>{format(date, 'EEEE, MMMM d, yyyy')}</dd>
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
  );
};

export default BookingSummary;
