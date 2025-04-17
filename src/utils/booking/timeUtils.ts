
import { addDays, addMinutes, format, isBefore, isAfter, parseISO, isSameDay } from 'date-fns';
import type { TimeSlot } from '@/types/booking';

export const generateTimeSlots = (date: Date, existingSessions: any[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // 8am
  const endHour = 20; // 8pm
  const now = new Date();
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotStartTime = new Date(date);
      slotStartTime.setHours(hour, minute, 0, 0);
      
      // Don't show past time slots for today
      if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && isBefore(slotStartTime, now)) {
        continue;
      }
      
      const slotEndTime = addMinutes(slotStartTime, 30);
      
      // Check if this slot overlaps with any existing session or recurring session
      const isAvailable = !existingSessions?.some(session => {
        const sessionStart = parseISO(session.start_time);
        const sessionEnd = parseISO(session.end_time);
        
        // Check for one-time session conflicts
        if (!session.is_recurring) {
          return (
            (isAfter(slotStartTime, sessionStart) && isBefore(slotStartTime, sessionEnd)) ||
            (isAfter(slotEndTime, sessionStart) && isBefore(slotEndTime, sessionEnd)) ||
            (isBefore(slotStartTime, sessionStart) && isAfter(slotEndTime, sessionEnd))
          );
        }
        
        // Check if this is a recurring session on the same day of week and time
        if (session.is_recurring) {
          // Check if day of week matches
          const sessionDayOfWeek = sessionStart.getDay();
          const slotDayOfWeek = slotStartTime.getDay();
          
          if (sessionDayOfWeek === slotDayOfWeek) {
            // Check if time matches (hour and minute)
            const sessionHour = sessionStart.getHours();
            const sessionMinute = sessionStart.getMinutes();
            const slotHour = slotStartTime.getHours();
            const slotMinute = slotStartTime.getMinutes();
            
            if (sessionHour === slotHour && sessionMinute === slotMinute) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      slots.push({
        start: format(slotStartTime, 'HH:mm'),
        end: format(slotEndTime, 'HH:mm'),
        available: isAvailable
      });
    }
  }
  
  return slots;
};

export const combineTimeSlots = (timeSlots: TimeSlot[], duration: string): TimeSlot[] => {
  const slotsNeeded = parseInt(duration) / 30;
  const combinedSlots: TimeSlot[] = [];
  
  for (let i = 0; i <= timeSlots.length - slotsNeeded; i++) {
    let allAvailable = true;
    
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
