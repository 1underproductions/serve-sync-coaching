
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, User, CalendarClock, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const payments = [
  {
    id: "1",
    player: "Michael Johnson",
    amount: 75,
    date: "July 24, 2023",
    status: "paid",
    type: "Individual Session",
  },
  {
    id: "2",
    player: "Junior Group",
    amount: 250,
    date: "July 22, 2023",
    status: "paid",
    type: "Monthly Subscription",
  },
  {
    id: "3",
    player: "Sarah Williams",
    amount: 75,
    date: "July 20, 2023",
    status: "paid",
    type: "Individual Session",
  },
  {
    id: "4",
    player: "David Smith",
    amount: 150,
    date: "July 19, 2023",
    status: "pending",
    type: "Package (2 sessions)",
  },
  {
    id: "5",
    player: "Adult Group",
    amount: 300,
    date: "July 15, 2023",
    status: "paid",
    type: "Monthly Subscription",
  },
];

const Payments = () => {
  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground mt-1">Track and manage your coaching revenue</p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/payments/new">
              <Plus className="h-4 w-4 mr-2" /> Record Payment
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,150</div>
              <p className="text-xs text-tennis-green-600 mt-1">↑ 15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$450</div>
              <p className="text-xs text-muted-foreground mt-1">3 pending payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">$1,200 monthly recurring</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4 space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{payment.player}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{payment.type}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">${payment.amount}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{payment.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {payment.status === "paid" ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-tennis-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        )}
                        <span
                          className={`capitalize ${
                            payment.status === "paid" ? "text-tennis-green-600" : "text-amber-500"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/payment/${payment.id}`}>Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="pending">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Pending payments will appear here</p>
            </div>
          </TabsContent>
          <TabsContent value="subscriptions">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Active subscriptions will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Payments;
