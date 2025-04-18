
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAdminData } from "@/hooks/useAdminData";
import { Users, DollarSign, Ticket, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { tickets, refunds } = useAdminData();

  const pendingTickets = tickets.data?.filter(t => t.status === 'open').length || 0;
  const pendingRefunds = refunds.data?.filter(r => r.status === 'pending').length || 0;

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTickets}</div>
            <Link to="/admin/tickets" className="text-xs text-tennis-green-600 mt-1 hover:underline">
              View all tickets
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRefunds}</div>
            <Link to="/admin/refunds" className="text-xs text-tennis-green-600 mt-1 hover:underline">
              Process refunds
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingTickets + pendingRefunds}
            </div>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.data?.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-start pb-4 last:pb-0 last:border-0 border-b">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Refund Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {refunds.data?.slice(0, 5).map((refund) => (
                <div key={refund.id} className="flex items-start pb-4 last:pb-0 last:border-0 border-b">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">${refund.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        refund.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                        refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {refund.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{refund.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested {new Date(refund.created_at).toLocaleDateString()}
                    </p>
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
