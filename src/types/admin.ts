
export type SupportTicket = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignee_id?: string;
  created_at: string;
  updated_at: string;
};

export type TicketReply = {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
};

export type Refund = {
  id: string;
  user_id: string;
  amount: number;
  original_transaction_id?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processed_by?: string;
  created_at: string;
  updated_at: string;
};
