import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  CalendarClock,
  X
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
  isToday,
  addDays
} from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const getFormattedDate = (dateStr) => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMMM d, yyyy');
  } catch (e) {
    return dateStr; // Fallback to original string if parsing fails
  }
};

const parseSessionDates = (sessions) => {
  return sessions.map(session => {
    const date = parseISO(session.date);
    
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const startDate = setMinutes(setHours(date, startHour), startMinute);
    
    const [endHour, endMinute] = session.endTime.split(':').map(Number);
    const endDate = setMinutes(setHours(date, endHour), endMinute);
    
    return {
      ...session,
      startDate,
      endDate,
    };
  });
};

const getDayContent = (day, parsedSessions) => {
  const daySessions = parsedSessions.filter(session => {
    try {
      return isSameDay(session.startDate, day);
    } catch (e) {
      console.error("Error comparing dates:", e);
      return false;
    }
  });
  
  if (daySessions.length === 0) {
    return null;
  }
  
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

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

const Schedule = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"list" | "week">("week");
  const [date, setDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(date, { weekStartsOn: 0 }));
  const [savedSessions, setSavedSessions] = useState([]);
  const [parsedSessions, setParsedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadSessions = () => {
      try {
        const sessionsStr = localStorage.getItem("sessions");
        console.log("Loaded sessions from localStorage:", sessionsStr);
        
        if (sessionsStr) {
          const loadedSessions = JSON.parse(sessionsStr);
          console.log("Parsed sessions:", loadedSessions);
          setSavedSessions(loadedSessions);
          
          const parsed = parseSessionDates(loadedSessions);
          console.log("Sessions with parsed dates:", parsed);
          setParsedSessions(parsed);
        } else {
          console.log("No sessions found in localStorage");
          setSavedSessions([]);
          setParsedSessions([]);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
        setSavedSessions([]);
        setParsedSessions([]);
      }
    };
    
    loadSessions();
    
    window.addEventListener('storage', loadSessions);
    
    return () => {
      window.removeEventListener('storage', loadSessions);
    };
  }, []);
  
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 0 }),
  });
  
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
  
  const goToToday = () => {
    const today = new Date();
    setDate(today);
    setWeekStart(startOfWeek(today, { weekStartsOn: 0 }));
  };

  const goToDate = (day) => {
    setDate(day);
    setWeekStart(startOfWeek(day, { weekStartsOn: 0 }));
  };
  
  const goToSession = (sessionId) => {
    navigate(`/session/${sessionId}`);
  };
  
  const getSessionsForTimeSlot = (day, hour) => {
    if (!parsedSessions.length) return [];
    
    return parsedSessions.filter(session => {
      try {
        const sessionHour = getHours(session.startDate);
        const sessionEndHour = getHours(session.endDate);
        const sessionMinutes = getMinutes(session.startDate);
        
        return (
          isSameDay(session.startDate, day) && 
          (sessionHour === hour || 
            (sessionHour < hour && sessionEndHour > hour) ||
            (sessionHour === hour - 1 && sessionMinutes >= 30 && hour > sessionHour))
        );
      } catch (e) {
        console.error("Error filtering sessions for time slot:", e);
        return false;
      }
    });
  };
  
  const calculateSessionStyle = (session, hour) => {
    try {
      const startHour = getHours(session.startDate);
      const startMinute = getMinutes(session.startDate);
      const endHour = getHours(session.endDate);
      const endMinute = getMinutes(session.endDate);
      
      let topOffset = 0;
      if (startHour === hour) {
        topOffset = (startMinute / 60) * 100;
      }
      
      let duration;
      if (startHour === hour) {
        if (endHour > hour) {
          duration = (60 - startMinute) / 60;
        } else {
          duration = (endMinute - startMinute) / 60;
        }
      } else if (startHour < hour && endHour > hour) {
        duration = 1;
      } else if (startHour < hour && endHour === hour) {
        duration = endMinute / 60;
      } else {
        duration = 0.5;
      }
      
      const heightPercent = Math.min(duration * 100, 100);
      
      return {
        top: `${topOffset}%`,
        height: `${heightPercent}%`,
        width: '90%',
        position: 'absolute',
        zIndex: 10,
      };
    } catch (e) {
      console.error("Error calculating session style:", e);
      return {};
    }
  };
  
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
  
  const openSessionDialog = (session) => {
    setSelectedSession(session);
    setIsSessionDialogOpen(true);
  };
  
  const renderListView = () => (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full md:w-auto grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-4 space-y-4">
        {savedSessions.length > 0 ? (
          savedSessions.map((session) => (
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
                      <span>{session.startTime} - {session.endTime}</span>
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
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No sessions scheduled yet</p>
            <Button className="mt-4 bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
              <Link to="/schedule/new">
                <Plus className="h-4 w-4 mr-2" /> Schedule Your First Session
              </Link>
            </Button>
          </div>
        )}
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
  
  const renderWeekView = () => (
    <div className="week-calendar">
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
      
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-center font-medium text-gray-500 border-r"></div>
        {weekDays.map((day) => (
          <div 
            key={day.toString()} 
            className={`p-2 text-center border-r last:border-r-0 relative cursor-pointer hover:bg-blue-50 ${
              isSameDay(day, new Date()) ? 'bg-blue-50' : ''
            }`}
            onClick={() => goToDate(day)}
          >
            <div className="font-medium">{format(day, 'EEE')}</div>
            <div className={`text-2xl ${
              isSameDay(day, new Date()) 
                ? 'rounded-full bg-blue-500 text-white w-10 h-10 flex items-center justify-center mx-auto'
                : ''
            }`}>
              {format(day, 'd')}
            </div>
            {getDayContent(day, parsedSessions)}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-8 h-[800px] overflow-y-auto relative">
        <div className="col-span-1 border-r">
          {timeSlots.map((hour) => (
            <div key={hour} className="h-20 border-b relative">
              <span className="absolute -top-3 left-2 text-sm text-gray-500">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>
        
        {weekDays.map((day) => (
          <div 
            key={day.toString()} 
            className="col-span-1 border-r last:border-r-0"
          >
            {timeSlots.map((hour) => {
              const sessionsInSlot = getSessionsForTimeSlot(day, hour);
              
              return (
                <div 
                  key={`${day}-${hour}`} 
                  className="h-20 border-b relative hover:bg-blue-50/50 cursor-pointer"
                  onClick={() => goToDate(day)}
                >
                  {sessionsInSlot.map((session, index) => {
                    try {
                      const style = calculateSessionStyle(session, hour);
                      const colorClass = getSessionColorClass(session.type);
                      
                      const shouldRender = 
                        getHours(session.startDate) === hour || 
                        (getHours(session.startDate) < hour && getHours(session.endDate) > hour) ||
                        (getHours(session.startDate) === hour - 1 && getMinutes(session.startDate) >= 30);
                      
                      const isFirstRender = getHours(session.startDate) === hour || 
                                            (getHours(session.startDate) < hour && !sessionsInSlot.some(s => 
                                              s.id === session.id && getHours(s.startDate) < hour - 1));
                      
                      if (shouldRender && isFirstRender) {
                        return (
                          <div
                            key={session.id}
                            className={`${colorClass} rounded px-2 text-xs overflow-hidden shadow-sm cursor-pointer`}
                            style={style as React.CSSProperties}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSessionDialog(session);
                            }}
                          >
                            <div className="font-medium truncate">{session.title}</div>
                            <div className="truncate">{session.player}</div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {session.startTime} - {session.endTime}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    } catch (e) {
                      console.error("Error rendering session:", e);
                      return null;
                    }
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
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
        
        <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
          <DialogContent className="sm:max-w-md">
            {selectedSession && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedSession.title}</DialogTitle>
                  <DialogDescription>
                    <span className={`inline-block text-xs px-2 py-1 mt-2 rounded-full ${
                      selectedSession.type === "individual" 
                        ? "bg-tennis-green-100 text-tennis-green-800"
                        : selectedSession.type === "group" 
                          ? "bg-tennis-blue-100 text-tennis-blue-800" 
                          : "bg-orange-100 text-orange-800"
                    }`}>
                      {selectedSession.type === "individual" 
                        ? "Individual" 
                        : selectedSession.type === "group" 
                          ? "Group" 
                          : "Tournament"}
                    </span>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="col-span-3">{selectedSession.player}</div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <div className="col-span-3">
                      {getFormattedDate(selectedSession.date)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="col-span-3">
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="col-span-3">{selectedSession.location}</div>
                  </div>
                  
                  {selectedSession.notes && (
                    <div className="border rounded-md p-3 mt-2">
                      <h4 className="font-medium mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{selectedSession.notes}</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/session/${selectedSession.id}/edit`}>Edit Session</Link>
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" size="sm">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Schedule;
