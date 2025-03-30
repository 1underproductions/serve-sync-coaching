
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { Users, DollarSign, CalendarClock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-tennis-green-600 mt-1">↑ 12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,320</div>
            <p className="text-xs text-tennis-green-600 mt-1">↑ 8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-tennis-green-600 mt-1">↑ 24% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">You and one other user</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <Link 
              to="/admin/users" 
              className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 mr-3 text-tennis-green-600" />
              <div>
                <h3 className="font-medium">Manage Users</h3>
                <p className="text-sm text-muted-foreground">View, edit, or remove users</p>
              </div>
            </Link>
            <Link 
              to="/admin/transactions" 
              className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-5 w-5 mr-3 text-tennis-green-600" />
              <div>
                <h3 className="font-medium">Review Transactions</h3>
                <p className="text-sm text-muted-foreground">Monitor payments and subscriptions</p>
              </div>
            </Link>
            <Link 
              to="/admin/settings" 
              className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-5 w-5 mr-3 text-tennis-green-600" />
              <div>
                <h3 className="font-medium">Admin Settings</h3>
                <p className="text-sm text-muted-foreground">Configure admin permissions</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "John Doe", action: "created a new account", time: "10 minutes ago" },
                { user: "Sarah Williams", action: "made a payment", time: "2 hours ago" },
                { user: "Mark Smith", action: "scheduled a new session", time: "5 hours ago" },
                { user: "Admin User", action: "updated system settings", time: "1 day ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start pb-4 last:pb-0 last:border-0 border-b">
                  <div className="w-full">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
