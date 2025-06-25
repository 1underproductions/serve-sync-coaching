
-- Create a table to track session payments
CREATE TABLE public.session_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  player_email TEXT,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'stripe', -- stripe, cash, bank_transfer, etc.
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  stripe_payment_intent_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to track session notifications
CREATE TABLE public.session_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- session_created, session_reminder, payment_due, payment_received
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  email_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.session_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for session_payments
CREATE POLICY "Coaches can view their own session payments" 
  ON public.session_payments 
  FOR SELECT 
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can insert their own session payments" 
  ON public.session_payments 
  FOR INSERT 
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update their own session payments" 
  ON public.session_payments 
  FOR UPDATE 
  USING (coach_id = auth.uid());

-- Create policies for session_notifications
CREATE POLICY "Coaches can view their own session notifications" 
  ON public.session_notifications 
  FOR SELECT 
  USING (coach_id = auth.uid());

CREATE POLICY "Edge functions can insert notifications" 
  ON public.session_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Edge functions can update notifications" 
  ON public.session_notifications 
  FOR UPDATE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_session_payments_session_id ON public.session_payments(session_id);
CREATE INDEX idx_session_payments_coach_id ON public.session_payments(coach_id);
CREATE INDEX idx_session_notifications_session_id ON public.session_notifications(session_id);
CREATE INDEX idx_session_notifications_coach_id ON public.session_notifications(coach_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_session_payments_updated_at
  BEFORE UPDATE ON public.session_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
