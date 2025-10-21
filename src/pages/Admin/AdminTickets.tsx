
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAdminData } from "@/hooks/useAdminData";
import { SupportTicket } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

const statusColors = {
  open: "bg-red-100 text-red-800 border-red-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const AdminTickets = () => {
  const { tickets, updateTicketStatus } = useAdminData();
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();

  const isLoading = tickets.isLoading;
  const allTickets = tickets.data || [];

  const filteredTickets = activeTab === "all" 
    ? allTickets 
    : allTickets.filter((ticket) => ticket.status === activeTab);

  const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
    await updateTicketStatus.mutateAsync({ ticketId, status: newStatus });
  };

  const assignTicket = async (ticketId: string) => {
    if (!user) return;
    await updateTicketStatus.mutateAsync({ 
      ticketId, 
      status: 'in_progress',
      assignee_id: user.id
    });
  };

  return (
    <AdminLayout
      title="Support Tickets"
      description="Manage and respond to customer support tickets"
    >
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white rounded-md p-6 text-center">
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-md shadow p-6">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold">{ticket.title}</h3>
                    <Badge className={statusColors[ticket.status] || ""}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="mt-2 text-gray-600">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      <span>Submitted {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                      {ticket.user_id && (
                        <span> by User ID: {ticket.user_id.slice(0, 8)}...</span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {ticket.status === 'open' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => assignTicket(ticket.id)}
                        >
                          Assign to me
                        </Button>
                      )}
                      
                      <Select
                        defaultValue={ticket.status}
                        onValueChange={(value) => 
                          handleStatusChange(ticket.id, value as SupportTicket['status'])
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminTickets;
