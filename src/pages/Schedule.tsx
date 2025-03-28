import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  List, 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  MapPin,
  CalendarClock
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO,
  addWeeks,
  subWeeks,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  isToday
} from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for demonstration - with proper date objects
const sessions = [
  {
    id: "1",
    title: "Advanced Forehand Drills",
    player: "Michael Johnson",
    date: "2023-07-24",
    startTime: "15:00",
    endTime: "16:00",
    time: "3:00 PM - 4:00 PM",
    type: "individual",
    location: "Court 2",
  },
  {
    id: "2",
    title: "Beginner Group Class",
    player: "Junior Group",
    date: "2023-07-25",
    startTime: "10:00",
    endTime: "11:30",
    time: "10:00 AM - 11:30 AM",
    type: "group",
    location: "Courts 3-4",
  },
  {
    id: "3",
    title: "Serve Practice",
    player: "Sarah Williams",
    date: "2023-07-25",
    startTime: "17:00",
    endTime: "18:00",
    time: "5:00 PM - 6:00 PM",
    type: "individual",
    location: "Court 1",
  },
  {
    id: "4",
    title: "Match Preparation",
    player: "David Smith",
    date: "2023-07-26",
    startTime: "16:00",
    endTime: "17:30",
    time: "4:00 PM - 5:30 PM",
    type: "individual",
    location: "Court 2",
  },
  {
    id: "5",
    title: "Advanced Group Class",
    player: "Adult Group",
    date: "2023-07-27",
    startTime: "18:00",
    endTime: "19:30",
    time: "6:00 PM - 7:30 PM",
    type: "group",
    location: "Courts 1-2",
  },
  {
    id: "6",
    title: "Tournament Prep",
    player: "Michael Johnson",
    date: "2023-07-28",
    startTime: "14:00",
    endTime: "16:00",
    time: "2:00 PM - 4:00 PM",
    type: "tournament",
    location: "Center Court",
  },
  {
    id: "7",
    title: "Youth Camp Session",
    player: "Kids Group",
    date: "2023-07-29",
    startTime: "09:00",
    endTime: "12:00",
    time: "9:00 AM - 12:00 PM",
    type: "group",
    location: "Courts 5-8",
  },
];

// Function to get styled date string
const getFormattedDate = (dateStr) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMMM d, yyyy');
  } catch (e) {
    return dateStr; // Fallback to original string if parsing fails
  }
};

// Helper function to convert sessions to Date objects
const parseSessionDates = (sessions) => {
  return sessions.map(session => {
    const date = parseISO(session.date);
    
    // Parse start time
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const startDate = setMinutes(setHours(date, startHour), startMinute);
    
    // Parse end time
    const [endHour, endMinute] = session.endTime.split(':').map(Number);
    const endDate = setMinutes(setHours(date, endHour), endMinute);
    
    return {
      ...session,
      startDate,
      endDate,
    };
  });
};

// Functions for the calendar view
const getSessionsByDate = (date) => {
  return sessions.filter(session => {
    try {
      return isSameDay(parseISO(session.date), date);
    } catch (e) {
      return false;
    }
  });
};

// Function to get sessions for the calendar day cells
const getDayContent = (day) => {
  const daySessions = getSessionsByDate(day);
  
  if (daySessions.length === 0) {
    return null;
  }
  
  // Return dots representing session types
  return (
    <div className="flex flex-wrap gap-1 mt-1 justify-center">
      {daySessions.map((session, index) => (
        <div 
          key={index} 
          className={`w-2 h-2 rounded-full ${
            session.type === 'individual' 
              ? 'bg-tennis-green-500' 
              : session.type === 'group' 
                ? 'bg-tennis-blue-500' 
                : 'bg-orange-500'
          }`}
          title={session.title}
        />
      ))}
    </div>
  );
};

// Time slots for the week view (24-hour format)
const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

const Schedule = () => {
  const [viewType, setViewType] = useState<"list" | "week">("week");
  const [date, setDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(date, { weekStartsOn: 0 }));
  const [parsedSessions, setParsedSessions] = useState([]);
  
  useEffect(() => {
    // Parse dates for easier manipulation
    setParsedSessions(parseSessionDates(sessions));
  }, []);
  
  // Calculate week days
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 0 }),
  });
  
  // Navigate to next/previous week
  const nextWeek = () => {
    const next = addWeeks(weekStart, 1);
    setWeekStart(next);
    setDate(next);
  };
  
  const prevWeek = () => {
    const prev = subWeeks(weekStart, 1);
    setWeekStart(prev);
    setDate(prev);
  };
  
  // Reset to current week
  const goToToday = () => {
    const today = new Date();
    setDate(today);
    setWeekStart(startOfWeek(today, { weekStartsOn: 0 }));
  };
  
  // Get sessions for a specific day and time slot
  const getSessionsForTimeSlot = (day, hour) => {
    if (!parsedSessions.length) return [];
    
    return parsedSessions.filter(session => {
      const sessionHour = getHours(session.startDate);
      const sessionEndHour = getHours(session.endDate);
      const sessionMinutes = getMinutes(session.startDate);
      
      return (
        isSameDay(session.startDate, day) && 
        (sessionHour === hour || 
          (sessionHour < hour && sessionEndHour > hour) ||
          (sessionHour === hour - 1 && sessionMinutes >= 30 && hour > sessionHour))
      );
    });
  };
  
  // Calculate session height and position
  const calculateSessionStyle = (session, hour) => {
    const startHour = getHours(session.startDate);
    const startMinute = getMinutes(session.startDate);
    const endHour = getHours(session.endDate);
    const endMinute = getMinutes(session.endDate);
    
    // Calculate top position (relative to the current hour cell)
    let topOffset = 0;
    if (startHour === hour) {
      topOffset = (startMinute / 60) * 100;
    }
    
    // Calculate height based on duration
    let duration;
    if (startHour === hour) {
      // If session starts in this hour
      if (endHour > hour) {
        // If it extends to next hour(s)
        duration = (60 - startMinute) / 60;
      } else {
        // If it ends in the same hour
        duration = (endMinute - startMinute) / 60;
      }
    } else if (startHour < hour && endHour > hour) {
      // If this is a middle hour of the session
      duration = 1; // Full hour
    } else if (startHour < hour && endHour === hour) {
      // If session ends in this hour
      duration = endMinute / 60;
    } else {
      duration = 0.5; // Default fallback
    }
    
    const heightPercent = Math.min(duration * 100, 100);
    
    // Return styles
    return {
      top: `${topOffset}%`,
      height: `${heightPercent}%`,
      width: '90%',
      position: 'absolute',
      zIndex: 10,
    };
  };
  
  // Determine session color
  const getSessionColorClass = (type) => {
    switch (type) {
      case 'individual':
        return 'bg-tennis-green-500 text-white';
      case 'group':
        return 'bg-tennis-blue-500 text-white';
      case 'tournament':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Render list view (original implementation)
  const renderListView = () => (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full md:w-auto grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-4 space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="card-hover">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    session.type === "individual"
                      ? "bg-tennis-green-100 text-tennis-green-800"
                      : session.type === "group"
                        ? "bg-tennis-blue-100 text-tennis-blue-800"
                        : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {session.type === "individual" 
                    ? "Individual" 
                    : session.type === "group" 
                      ? "Group" 
                      : "Tournament"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{session.player}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{getFormattedDate(session.date)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{session.location}</span>
                  </div>
                </div>
                <div className="flex space-x-2 md:justify-end items-center">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/session/${session.id}`}>View</Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/session/${session.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
      <TabsContent value="past">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Past sessions will appear here</p>
        </div>
      </TabsContent>
      <TabsContent value="all">
        <div className="text-center py-12">
          <p className="text-muted-foreground">All sessions will appear here</p>
        </div>
      </TabsContent>
    </Tabs>
  );
  
  // Render week view (Google Calendar style)
  const renderWeekView = () => (
    <div className="week-calendar">
      {/* Week navigation header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold ml-2">
            {format(weekStart, 'MMMM yyyy')}
          </h2>
        </div>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-center font-medium text-gray-500 border-r"></div>
        {weekDays.map((day) => (
          <div 
            key={day.toString()} 
            className={`p-2 text-center border-r last:border-r-0 relative ${
              isSameDay(day, new Date()) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="font-medium">{format(day, 'EEE')}</div>
            <div className={`text-2xl ${
              isSameDay(day, new Date()) 
                ? 'rounded-full bg-blue-500 text-white w-10 h-10 flex items-center justify-center mx-auto'
                : ''
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time grid */}
      <div className="grid grid-cols-8 h-[800px] overflow-y-auto relative">
        {/* Time labels */}
        <div className="col-span-1 border-r">
          {timeSlots.map((hour) => (
            <div key={hour} className="h-20 border-b relative">
              <span className="absolute -top-3 left-2 text-sm text-gray-500">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>
        
        {/* Day columns with sessions */}
        {weekDays.map((day) => (
          <div key={day.toString()} className="col-span-1 border-r last:border-r-0">
            {timeSlots.map((hour) => {
              const sessionsInSlot = getSessionsForTimeSlot(day, hour);
              
              return (
                <div key={`${day}-${hour}`} className="h-20 border-b relative">
                  {/* Render sessions in this time slot */}
                  {sessionsInSlot.map((session, index) => {
                    const style = calculateSessionStyle(session, hour);
                    const colorClass = getSessionColorClass(session.type);
                    
                    // Only render if it's the session's start hour or if spanning from previous hour
                    const shouldRender = 
                      getHours(session.startDate) === hour || 
                      (getHours(session.startDate) < hour && getHours(session.endDate) > hour) ||
                      (getHours(session.startDate) === hour - 1 && getMinutes(session.startDate) >= 30);
                    
                    // Skip already rendered sessions (avoid duplicates across hour slots)
                    const isFirstRender = getHours(session.startDate) === hour || 
                                          (getHours(session.startDate) < hour && !sessionsInSlot.some(s => 
                                            s.id === session.id && getHours(s.startDate) < hour - 1));
                    
                    if (shouldRender && isFirstRender) {
                      return (
                        <div
                          key={session.id}
                          className={`${colorClass} rounded px-2 text-xs overflow-hidden shadow-sm cursor-pointer`}
                          style={style as React.CSSProperties}
                        >
                          <div className="font-medium truncate">{session.title}</div>
                          <div className="truncate">{session.player}</div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(session.startDate, 'h:mm a')} - {format(session.endDate, 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex mt-4 justify-end gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-tennis-green-500 mr-2"></div>
          <span>Individual</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-tennis-blue-500 mr-2"></div>
          <span>Group</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
          <span>Tournament</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage your upcoming coaching sessions</p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/schedule/new">
              <Plus className="h-4 w-4 mr-2" /> New Session
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <ToggleGroup type="single" value={viewType} onValueChange={(value) => value && setViewType(value as "list" | "week")}>
            <ToggleGroupItem value="week" aria-label="Week view">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4 mr-2" />
              List
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {viewType === "list" ? renderListView() : renderWeekView()}
      </div>
    </Layout>
  );
};

export default Schedule;
