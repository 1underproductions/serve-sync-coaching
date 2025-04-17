
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface Coach {
  full_name: string;
  hourly_rate: number;
  location: string;
  avatar_url?: string;
}

export interface BookingSummaryProps {
  date: Date;
  selectedTimeSlot: string;
  selectedDuration: string;
  coachInfo: Coach | null;
}

export interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: (slot: string | null) => void;
  loadingSlot: string | null;
}
