
import { BarChart, PieChart, LineChart, CalendarClock, TrendingUp, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Chart as ChartComponent, 
  LineElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Tooltip, 
  Legend 
} from "chart.js";
import { Line, Bar } from "recharts";

// Register Chart.js components
ChartComponent.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const sessionsData = [
  { name: "Mon", sessions: 4 },
  { name: "Tue", sessions: 7 },
  { name: "Wed", sessions: 5 },
  { name: "Thu", sessions: 6 },
  { name: "Fri", sessions: 8 },
  { name: "Sat", sessions: 12 },
  { name: "Sun", sessions: 10 },
];

const revenueData = [
  { name: "Jan", revenue: 2100 },
  { name: "Feb", revenue: 1800 },
  { name: "Mar", revenue: 2400 },
  { name: "Apr", revenue: 2700 },
  { name: "May", revenue: 2900 },
  { name: "Jun", revenue: 3100 },
];

const playerActivityData = [
  { name: "New", value: 12 },
  { name: "Active", value: 48 },
  { name: "Inactive", value: 8 },
];

const Analytics = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View insights and statistics about your coaching business.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">52</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$14,532</div>
              <p className="text-xs text-muted-foreground">
                +10.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">
                +4 new players this month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Sessions</CardTitle>
              <CardDescription>Number of sessions per day this week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full w-full flex items-center justify-center">
                <BarChart className="h-24 w-24 text-muted-foreground" />
                <p className="text-center text-muted-foreground mt-4">
                  Chart visualization will be implemented with live data
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Your earnings over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full w-full flex items-center justify-center">
                <LineChart className="h-24 w-24 text-muted-foreground" />
                <p className="text-center text-muted-foreground mt-4">
                  Chart visualization will be implemented with live data
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Player Activity</CardTitle>
            <CardDescription>Distribution of active, inactive, and new players</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="h-full w-full flex items-center justify-center">
              <PieChart className="h-24 w-24 text-muted-foreground" />
              <p className="text-center text-muted-foreground mt-4">
                Chart visualization will be implemented with live data
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground mt-8">
          <p>Note: This is a placeholder analytics dashboard with sample data.</p>
          <p>Real data integration will be implemented in a future update.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
