
import { CalendarClock, Users, DollarSign, MessageSquare } from "lucide-react";
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingSessionCard from "@/components/dashboard/UpcomingSessionCard";
import PlayerCard from "@/components/players/PlayerCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Mock data for demonstration
const upcomingSessions = [
  { id: "1", title: "Advanced Forehand Drills", playerName: "Michael Johnson", date: "Today", time: "3:00 PM - 4:00 PM", type: 'individual' as const },
  { id: "2", title: "Beginner Group Class", playerName: "Junior Group", date: "Tomorrow", time: "10:00 AM - 11:30 AM", type: 'group' as const },
  { id: "3", title: "Serve Practice", playerName: "Sarah Williams", date: "Jul 25, 2023", time: "5:00 PM - 6:00 PM", type: 'individual' as const },
];

const recentPlayers = [
  { id: "1", name: "Michael Johnson", skill: "Intermediate", age: 28, email: "michael@example.com", sessionsCount: 12 },
  { id: "2", name: "Sarah Williams", skill: "Advanced", age: 24, email: "sarah@example.com", sessionsCount: 24 },
  { id: "3", name: "David Smith", skill: "Beginner", age: 32, email: "david@example.com", sessionsCount: 5 },
];

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, Coach!</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your coaching business today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Upcoming Sessions"
            value="8"
            description="3 sessions today"
            icon={<CalendarClock className="h-4 w-4" />}
          />
          <StatsCard
            title="Active Players"
            value="24"
            description="2 new this month"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Monthly Revenue"
            value="$2,150"
            description="Up 15% from last month"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatsCard
            title="Unread Messages"
            value="3"
            description="2 from parents, 1 from players"
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Upcoming Sessions</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/schedule">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <UpcomingSessionCard key={session.id} {...session} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-heading">Recent Players</h2>
              <Button variant="outline" size="sm" asChild>
                <Link to="/players">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentPlayers.map((player) => (
                <PlayerCard key={player.id} {...player} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions for your coaching business</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                <Link to="/schedule/new">
                  <CalendarClock className="h-5 w-5 mb-1" />
                  <span>New Session</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                <Link to="/players/new">
                  <Users className="h-5 w-5 mb-1" />
                  <span>Add Player</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                <Link to="/messages/new">
                  <MessageSquare className="h-5 w-5 mb-1" />
                  <span>Send Message</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center space-y-1">
                <Link to="/payments/new">
                  <DollarSign className="h-5 w-5 mb-1" />
                  <span>Record Payment</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month's Overview</CardTitle>
              <CardDescription>Summary of your coaching activities this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Total Sessions</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Individual Sessions</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Group Sessions</span>
                <span className="font-medium">14</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">New Players</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Hours Coached</span>
                <span className="font-medium">68</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
