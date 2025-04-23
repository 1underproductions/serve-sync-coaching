
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, Users, Calendar } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for charts (in a real app, this would come from an API or props)
const activityData = [
  { name: 'Mon', sessions: 4 },
  { name: 'Tue', sessions: 3 },
  { name: 'Wed', sessions: 7 },
  { name: 'Thu', sessions: 5 },
  { name: 'Fri', sessions: 8 },
  { name: 'Sat', sessions: 12 },
  { name: 'Sun', sessions: 6 },
];

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  className?: string;
}

const StatCard = ({ title, value, description, icon, className }: StatCardProps) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PlatformOverviewTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value="128" 
          description="+12% from last month"
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <StatCard 
          title="Active Coaches" 
          value="42" 
          description="23 verified coaches" 
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <StatCard 
          title="Sessions This Month" 
          value="384" 
          description="+8% from last month" 
          icon={<Calendar className="h-6 w-6 text-primary" />}
        />
        <StatCard 
          title="Platform Health" 
          value="98.7%" 
          description="Uptime this month" 
          icon={<Activity className="h-6 w-6 text-primary" />}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Number of coaching sessions per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>New users in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Sarah Johnson', email: 'sarah.j@example.com', date: 'Today' },
                { name: 'Michael Chen', email: 'michael.c@example.com', date: 'Yesterday' },
                { name: 'Emma Wilson', email: 'emma.w@example.com', date: '3 days ago' }
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current platform status and recent issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <p className="font-medium">All Systems Operational</p>
              </div>
              <div className="text-sm space-y-3">
                <div className="border-l-2 border-yellow-400 pl-3 py-1">
                  <p className="font-medium">Payment Processing Delay</p>
                  <p className="text-xs text-muted-foreground">Resolved - April 22, 2025</p>
                </div>
                <div className="border-l-2 border-green-400 pl-3 py-1">
                  <p className="font-medium">Scheduled Maintenance</p>
                  <p className="text-xs text-muted-foreground">Completed - April 20, 2025</p>
                </div>
                <div className="border-l-2 border-green-400 pl-3 py-1">
                  <p className="font-medium">Email Notification Delay</p>
                  <p className="text-xs text-muted-foreground">Resolved - April 18, 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
