
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users, DollarSign, MessageSquare, BarChart, PlusCircle, FileText } from "lucide-react";
import Layout from "@/components/layout/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingSessionCard from "@/components/dashboard/UpcomingSessionCard";
import PlayerCard from "@/components/players/PlayerCard";
import TestNotificationButton from "@/components/notifications/TestNotificationButton";
import EmptyState from "@/components/dashboard/EmptyState";
import { Link, useNavigate } from "react-router-dom";
import { useSessionStats } from "@/hooks/useSessionStats";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { useRevenueStats } from "@/hooks/useRevenueStats";

const upcomingSessions = [
  { id: "1", title: "Advanced Forehand Drills", playerName: "Michael Johnson", date: "Today", time: "3:00 PM - 4:00 PM", type: 'individual' as const },
  { id: "2", title: "Beginner Group Class", playerName: "Junior Group", date: "Tomorrow", time: "10:00 AM - 11:30 AM", type: 'group' as const },
  { id: "3", title: "Serve Practice", playerName: "Sarah Williams", date: "Jul 25, 2023", time: "5:00 PM - 6:00 PM", type: 'individual' as const },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats: sessionStats, isLoading: sessionLoading } = useSessionStats();
  const { stats: playerStats, isLoading: playerLoading } = usePlayerStats();
  const { stats: revenueStats, isLoading: revenueLoading } = useRevenueStats();

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
          <div className="flex items-center gap-2">
            <TestNotificationButton />
            <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
              <Link to="/schedule/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Session
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Upcoming Sessions"
            value={sessionLoading ? "..." : sessionStats.totalUpcoming.toString()}
            description={sessionLoading ? "Loading..." : `${sessionStats.todaySessions} sessions today`}
            icon={<CalendarClock className="h-4 w-4" />}
            trend={sessionStats.trendPercentage > 0 ? {
              value: `${sessionStats.trendPercentage}%`,
              positive: sessionStats.trendPositive
            } : undefined}
          />
          <StatsCard
            title="Active Players"
            value={playerLoading ? "..." : playerStats.totalPlayers.toString()}
            description={playerLoading ? "Loading..." : `${playerStats.newThisMonth} new this month`}
            icon={<Users className="h-4 w-4" />}
            trend={playerStats.newThisMonth > 0 ? { value: `${playerStats.newThisMonth} new`, positive: true } : undefined}
          />
          <StatsCard
            title="Monthly Revenue"
            value={revenueLoading ? "..." : `$${revenueStats.monthlyRevenue.toLocaleString()}`}
            description={revenueLoading ? "Loading..." : "Revenue this month"}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatsCard
            title="Unread Messages"
            value="0"
            description="No new messages"
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
              {sessionStats.totalUpcoming === 0 ? (
                <EmptyState
                  icon={<CalendarClock className="h-8 w-8" />}
                  title="No upcoming sessions"
                  description="Schedule your first session to get started"
                  action={
                    <Button asChild size="sm" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                      <Link to="/schedule/new">Schedule Session</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <UpcomingSessionCard key={session.id} {...session} />
                  ))}
                </div>
              )}
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
              {playerStats.recentPlayers.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8" />}
                  title="No players yet"
                  description="Add your first player to start building your coaching roster"
                  action={
                    <Button asChild size="sm" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                      <Link to="/players/new">Add Player</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {playerStats.recentPlayers.map((player) => (
                    <PlayerCard 
                      key={player.id} 
                      {...player}
                      phone=""
                      extraActions={null}
                    />
                  ))}
                </div>
              )}
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
              {revenueStats.monthlyRevenue === 0 && revenueStats.outstandingAmount === 0 ? (
                <EmptyState
                  icon={<DollarSign className="h-8 w-8" />}
                  title="No revenue data"
                  description="Start recording payments to track your revenue"
                  action={
                    <Button asChild size="sm" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                      <Link to="/payments/new">Create Payment Link</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">This Month</div>
                        <div className="text-2xl font-bold mt-1">${revenueStats.monthlyRevenue.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Outstanding</div>
                        <div className="text-2xl font-bold mt-1">${revenueStats.outstandingAmount.toLocaleString()}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {revenueStats.recentTransactions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recent Transactions</div>
                      {revenueStats.recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-tennis-green-50 rounded-full text-tennis-green-700">
                              <DollarSign className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{transaction.playerName}</div>
                              <div className="text-xs text-muted-foreground">{transaction.sessionType}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">${transaction.amount}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                  <span>Create payment link</span>
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
                  <span className="font-medium">{sessionLoading ? "..." : sessionStats.thisWeekSessions * 4}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Individual Sessions</span>
                  <span className="font-medium">{sessionLoading ? "..." : Math.floor(sessionStats.thisWeekSessions * 4 * 0.7)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Group Sessions</span>
                  <span className="font-medium">{sessionLoading ? "..." : Math.floor(sessionStats.thisWeekSessions * 4 * 0.3)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">New Players</span>
                  <span className="font-medium">{playerLoading ? "..." : playerStats.newThisMonth}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Hours Coached</span>
                  <span className="font-medium">{sessionLoading ? "..." : sessionStats.thisWeekSessions * 4}</span>
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
