import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SupportTicket, TicketReply, Refund } from "@/types/admin";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/useAuth";

export function useAdminData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const tickets = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error("Not authorized to view tickets");
      }
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: isAdmin // Only run the query if the user is an admin
  });

  const refunds = useQuery({
    queryKey: ['admin-refunds'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error("Not authorized to view refunds");
      }
      
      const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Refund[];
    },
    enabled: isAdmin // Only run the query if the user is an admin
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status, assignee_id }: { 
      ticketId: string; 
      status: SupportTicket['status']; 
      assignee_id?: string 
    }) => {
      const updateData: Partial<SupportTicket> = { status };
      
      // If assignee_id is provided, add it to the update data
      if (assignee_id) {
        updateData.assignee_id = assignee_id;
      }
      
      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update ticket status",
      });
    },
  });

  const processRefund = useMutation({
    mutationFn: async ({ refundId, status, processed_by }: { refundId: string; status: Refund['status']; processed_by: string }) => {
      const { error } = await supabase
        .from('refunds')
        .update({ status, processed_by })
        .eq('id', refundId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      toast({
        title: "Success",
        description: "Refund processed successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process refund",
      });
    },
  });

  return {
    tickets,
    refunds,
    updateTicketStatus,
    processRefund,
  };
}
