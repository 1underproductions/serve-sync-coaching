
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { DollarSign, Calendar, Clock, User, Mail } from "lucide-react";
import { format, addDays } from "date-fns";

interface SessionPayment {
  id: string;
  session_id: string;
  coach_id: string;
  player_email?: string;
  amount?: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  payment_date?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
}

interface SessionPaymentManagerProps {
  sessionId: string;
  sessionDetails: {
    title: string;
    date: string;
    startTime: string;
    player: string;
    playerEmail?: string;
    location: string;
  };
  coachName: string;
}

const SessionPaymentManager = ({ sessionId, sessionDetails, coachName }: SessionPaymentManagerProps) => {
  const [payment, setPayment] = useState<SessionPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSessionPayment();
  }, [sessionId]);

  const fetchSessionPayment = async () => {
    try {
      const { data, error } = await supabase
        .from('session_payments')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) throw error;
      setPayment(data);
    } catch (error) {
      console.error('Error fetching session payment:', error);
      toast({
        title: "Error",
        description: "Failed to load payment information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('session_payments')
        .insert({
          session_id: sessionId,
          coach_id: userData.user.id,
          player_email: sessionDetails.playerEmail,
          amount: parseFloat(amount),
          currency: 'USD',
          payment_method: paymentMethod,
          payment_status: 'pending',
          due_date: dueDate,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;

      setPayment(data);
      
      // Send payment due notification if player email exists
      if (sessionDetails.playerEmail) {
        await sendNotification('payment_due');
      }

      toast({
        title: "Payment Created",
        description: "Payment tracking has been set up for this session"
      });

      // Clear form
      setAmount('');
      setNotes('');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to create payment record",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updatePaymentStatus = async (status: string) => {
    if (!payment) return;

    try {
      const updates: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'paid') {
        updates.payment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('session_payments')
        .update(updates)
        .eq('id', payment.id);

      if (error) throw error;

      setPayment({ ...payment, ...updates });

      // Send confirmation notification if marked as paid
      if (status === 'paid' && sessionDetails.playerEmail) {
        await sendNotification('payment_received');
      }

      toast({
        title: "Payment Updated",
        description: `Payment status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const sendNotification = async (type: 'payment_due' | 'payment_received') => {
    if (!sessionDetails.playerEmail) return;

    try {
      await supabase.functions.invoke('send-session-notification', {
        body: {
          sessionId,
          notificationType: type,
          recipientEmail: sessionDetails.playerEmail,
          sessionDetails: {
            title: sessionDetails.title,
            date: sessionDetails.date,
            time: sessionDetails.startTime,
            location: sessionDetails.location,
            coachName,
            playerName: sessionDetails.player,
            amount: payment?.amount
          }
        }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading payment information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Tracking
        </CardTitle>
        <CardDescription>
          Manage payment for this session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {payment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <p className="text-lg font-semibold">${payment.amount} {payment.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div>
                  <Badge className={getStatusColor(payment.payment_status)}>
                    {payment.payment_status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <p className="capitalize">{payment.payment_method}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <p>{payment.due_date ? format(new Date(payment.due_date), 'MMM d, yyyy') : 'Not set'}</p>
              </div>
            </div>

            {payment.notes && (
              <div>
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm text-gray-600">{payment.notes}</p>
              </div>
            )}

            {payment.payment_status === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => updatePaymentStatus('paid')}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Mark as Paid
                </Button>
                <Button 
                  onClick={() => updatePaymentStatus('failed')}
                  variant="outline"
                  size="sm"
                >
                  Mark as Failed
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="text-sm font-medium">Amount ($)</label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this payment..."
                rows={2}
              />
            </div>
          </div>
        )}
      </CardContent>
      {!payment && (
        <CardFooter>
          <Button 
            onClick={createPayment}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Set Up Payment Tracking'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SessionPaymentManager;
