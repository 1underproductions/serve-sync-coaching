
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  expiresAt?: Date;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase.rpc('create_payment_notification', {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_related_id: params.relatedId || null
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

// Payment-related notification helpers
export const createPaymentDueNotification = async (
  userId: string,
  sessionTitle: string,
  amount: number,
  dueDate: Date,
  sessionId: string
) => {
  return createNotification({
    userId,
    type: 'payment_due',
    title: 'Payment Due',
    message: `Payment of $${amount} for "${sessionTitle}" is due on ${dueDate.toLocaleDateString()}`,
    relatedId: sessionId
  });
};

export const createPaymentOverdueNotification = async (
  userId: string,
  sessionTitle: string,
  amount: number,
  daysPastDue: number,
  sessionId: string
) => {
  return createNotification({
    userId,
    type: 'payment_overdue',
    title: 'Payment Overdue',
    message: `Payment of $${amount} for "${sessionTitle}" is ${daysPastDue} days overdue`,
    relatedId: sessionId
  });
};

export const createPaymentReceivedNotification = async (
  userId: string,
  sessionTitle: string,
  amount: number,
  sessionId: string
) => {
  return createNotification({
    userId,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment of $${amount} received for "${sessionTitle}"`,
    relatedId: sessionId
  });
};
