
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Clock, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";

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

const Schedule = () => {
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
      </div>
    </Layout>
  );
};

export default Schedule;
