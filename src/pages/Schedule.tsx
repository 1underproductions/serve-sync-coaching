
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Clock, List, Calendar as CalendarIcon, Plus, User, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format, isToday, parseISO, isSameDay } from "date-fns";

// Mock data for demonstration - with proper date objects
const sessions = [
  {
    id: "1",
    title: "Advanced Forehand Drills",
    player: "Michael Johnson",
    date: "2023-07-24",
    time: "3:00 PM - 4:00 PM",
    type: "individual",
    location: "Court 2",
  },
  {
    id: "2",
    title: "Beginner Group Class",
    player: "Junior Group",
    date: "2023-07-25",
    time: "10:00 AM - 11:30 AM",
    type: "group",
    location: "Courts 3-4",
  },
  {
    id: "3",
    title: "Serve Practice",
    player: "Sarah Williams",
    date: "2023-07-25",
    time: "5:00 PM - 6:00 PM",
    type: "individual",
    location: "Court 1",
  },
  {
    id: "4",
    title: "Match Preparation",
    player: "David Smith",
    date: "2023-07-26",
    time: "4:00 PM - 5:30 PM",
    type: "individual",
    location: "Court 2",
  },
  {
    id: "5",
    title: "Advanced Group Class",
    player: "Adult Group",
    date: "2023-07-27",
    time: "6:00 PM - 7:30 PM",
    type: "group",
    location: "Courts 1-2",
  },
  {
    id: "6",
    title: "Tournament Prep",
    player: "Michael Johnson",
    date: "2023-07-28",
    time: "2:00 PM - 4:00 PM",
    type: "tournament",
    location: "Center Court",
  },
  {
    id: "7",
    title: "Youth Camp Session",
    player: "Kids Group",
    date: "2023-07-29",
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

const Schedule = () => {
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [date, setDate] = useState<Date>(new Date());
  
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
          <ToggleGroup type="single" value={viewType} onValueChange={(value) => value && setViewType(value as "list" | "calendar")}>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4 mr-2" />
              List
            </ToggleGroupItem>
            <ToggleGroupItem value="calendar" aria-label="Calendar view">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {viewType === "list" ? (
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
        ) : (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  components={{
                    DayContent: ({ date }) => (
                      <div className="w-full h-full flex flex-col items-center">
                        <span className={isToday(date) ? "font-bold" : ""}>
                          {format(date, "d")}
                        </span>
                        {getDayContent(date)}
                      </div>
                    ),
                  }}
                  className="rounded-md border p-3"
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Sessions for {format(date, 'MMMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {getSessionsByDate(date).length > 0 ? (
                      getSessionsByDate(date).map((session) => (
                        <div 
                          key={session.id} 
                          className={`rounded-lg p-4 shadow-sm border-l-4 ${
                            session.type === "individual"
                              ? "border-tennis-green-500 bg-tennis-green-50"
                              : session.type === "group"
                                ? "border-tennis-blue-500 bg-tennis-blue-50"
                                : "border-orange-500 bg-orange-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-lg">{session.title}</h4>
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
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{session.player}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{session.time}</span>
                            </div>
                            <div className="flex items-center text-sm col-span-2">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{session.location}</span>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/session/${session.id}`}>View</Link>
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/session/${session.id}/edit`}>Edit</Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground mb-4">No sessions scheduled for this day</p>
                        <Button variant="outline" className="mt-2" asChild>
                          <Link to="/schedule/new">
                            <Plus className="h-4 w-4 mr-2" /> Schedule Session
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-tennis-green-500 mr-2"></div>
                        <span>Individual Sessions</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-tennis-blue-500 mr-2"></div>
                        <span>Group Classes</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span>Tournament Coaching</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
