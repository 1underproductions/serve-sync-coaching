
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import type { TimeSlotSelectorProps } from '@/types/booking';

const TimeSlotSelector = ({
  timeSlots,
  selectedTimeSlot,
  setSelectedTimeSlot,
  loadingSlot
}: TimeSlotSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {timeSlots.map((slot) => (
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
  );
};

export default TimeSlotSelector;
