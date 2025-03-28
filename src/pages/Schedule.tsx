
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Clock, List, Calendar as CalendarIcon, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Mock data for demonstration
const sessions = [
  {
    id: "1",
    title: "Advanced Forehand Drills",
    player: "Michael Johnson",
    date: "July 24, 2023",
    time: "3:00 PM - 4:00 PM",
    type: "individual",
    location: "Court 2",
  },
  {
    id: "2",
    title: "Beginner Group Class",
    player: "Junior Group",
    date: "July 25, 2023",
    time: "10:00 AM - 11:30 AM",
    type: "group",
    location: "Courts 3-4",
  },
  {
    id: "3",
    title: "Serve Practice",
    player: "Sarah Williams",
    date: "July 25, 2023",
    time: "5:00 PM - 6:00 PM",
    type: "individual",
    location: "Court 1",
  },
  {
    id: "4",
    title: "Match Preparation",
    player: "David Smith",
    date: "July 26, 2023",
    time: "4:00 PM - 5:30 PM",
    type: "individual",
    location: "Court 2",
  },
  {
    id: "5",
    title: "Advanced Group Class",
    player: "Adult Group",
    date: "July 27, 2023",
    time: "6:00 PM - 7:30 PM",
    type: "group",
    location: "Courts 1-2",
  },
];

// Create a map of sessions by date for the calendar view
const getSessionsByDate = () => {
  const sessionMap = new Map();
  
  sessions.forEach(session => {
    // This is a simplified approach - in a real app, you'd parse the date string properly
    const dateStr = session.date;
    if (!sessionMap.has(dateStr)) {
      sessionMap.set(dateStr, []);
    }
    sessionMap.get(dateStr).push(session);
  });
  
  return sessionMap;
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
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
                            : "bg-tennis-blue-100 text-tennis-blue-800"
                        }`}
                      >
                        {session.type === "individual" ? "Individual" : "Group"}
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
                          <span>{session.date}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-muted-foreground mr-2">Location:</span>
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
            <TabsContent value="calendar">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Calendar view will be available in the next update</p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="rounded-md border p-3 pointer-events-auto"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sessions for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardTitle>
              </CardHeader>
              <CardContent>
                {getSessionsByDate().get(date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })) ? (
                  getSessionsByDate().get(date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })).map((session) => (
                    <div key={session.id} className="border-b py-3 last:border-0 last:pb-0 first:pt-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            {session.time} • {session.player} • {session.location}
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            session.type === "individual"
                              ? "bg-tennis-green-100 text-tennis-green-800"
                              : "bg-tennis-blue-100 text-tennis-blue-800"
                          }`}
                        >
                          {session.type === "individual" ? "Individual" : "Group"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No sessions scheduled for this day</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/schedule/new">
                        <Plus className="h-4 w-4 mr-2" /> Schedule Session
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schedule;
