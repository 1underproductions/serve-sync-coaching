import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users, DollarSign, MessageSquare, BarChart, PlusCircle, FileText } from "lucide-react";
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingSessionCard from "@/components/dashboard/UpcomingSessionCard";
import PlayerCard from "@/components/players/PlayerCard";
import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleUpcomingSessionsClick = () => {
    navigate('/schedule?view=list');
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, Coach! Here's what's happening with your coaching business today.
            </p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/schedule/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Session
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Upcoming Sessions"
            value="8"
            description="3 sessions today"
            icon={<CalendarClock className="h-4 w-4" />}
            trend={{ value: "15%", positive: true }}
          />
          <StatsCard
            title="Active Players"
            value="24"
            description="2 new this month"
            icon={<Users className="h-4 w-4" />}
            trend={{ value: "8%", positive: true }}
          />
          <StatsCard
            title="Monthly Revenue"
            value="$2,150"
            description="Up from last month"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: "15%", positive: true }}
          />
          <StatsCard
            title="Unread Messages"
            value="3"
            description="2 from parents, 1 from players"
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="md:col-span-1 lg:col-span-1 cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={handleUpcomingSessionsClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Upcoming Sessions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/schedule?view=list" className="text-tennis-green-600 font-medium">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <UpcomingSessionCard key={session.id} {...session} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Recent Players</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/players" className="text-tennis-green-600 font-medium">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPlayers.map((player) => (
                  <PlayerCard key={player.id} {...player} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/payments" className="text-tennis-green-600 font-medium">Details</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">This Month</div>
                      <div className="text-2xl font-bold mt-1">$2,150</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Outstanding</div>
                      <div className="text-2xl font-bold mt-1">$450</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Recent Transactions</div>
                  <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-tennis-green-50 rounded-full text-tennis-green-700">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Sarah Williams</div>
                        <div className="text-xs text-muted-foreground">Private Lesson</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$75</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-tennis-green-50 rounded-full text-tennis-green-700">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Junior Group</div>
                        <div className="text-xs text-muted-foreground">Group Class</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$180</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions for your coaching business</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Summary of your coaching activities this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
              </div>

              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
