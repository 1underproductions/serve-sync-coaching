
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Mail, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface SessionNotification {
  id: string;
  session_id: string;
  recipient_email: string;
  notification_type: string;
  sent_at?: string;
  status: string;
  error_message?: string;
  created_at: string;
}

interface SessionNotificationManagerProps {
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

const SessionNotificationManager = ({ sessionId, sessionDetails, coachName }: SessionNotificationManagerProps) => {
  const [notifications, setNotifications] = useState<SessionNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [sessionId]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('session_notifications')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = async (type: 'session_created' | 'session_reminder' | 'payment_due') => {
    if (!sessionDetails.playerEmail) {
      toast({
        title: "No Email Address",
        description: "Player email is required to send notifications",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-session-notification', {
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
            playerName: sessionDetails.player
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Notification Sent",
        description: `${type.replace('_', ' ')} notification sent successfully`
      });

      // Refresh notifications list
      await fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNotificationType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const hasNotificationType = (type: string) => {
    return notifications.some(n => n.notification_type === type && n.status === 'sent');
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Session Notifications
        </CardTitle>
        <CardDescription>
          Send notifications to participants about this session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionDetails.playerEmail ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>Notifications will be sent to: {sessionDetails.playerEmail}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Confirmation</h4>
                  <p className="text-sm text-gray-500">Confirm session details with participant</p>
                </div>
                <Button
                  onClick={() => sendNotification('session_created')}
                  disabled={isSending || hasNotificationType('session_created')}
                  size="sm"
                  variant={hasNotificationType('session_created') ? "outline" : "default"}
                >
                  {hasNotificationType('session_created') ? 'Sent' : 'Send'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Session Reminder</h4>
                  <p className="text-sm text-gray-500">Send reminder before the session</p>
                </div>
                <Button
                  onClick={() => sendNotification('session_reminder')}
                  disabled={isSending}
                  size="sm"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send Reminder
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Payment Due</h4>
                  <p className="text-sm text-gray-500">Notify about payment requirements</p>
                </div>
                <Button
                  onClick={() => sendNotification('payment_due')}
                  disabled={isSending}
                  size="sm"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send Notice
                </Button>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Notification History</h4>
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(notification.status)}
                        <div>
                          <p className="font-medium text-sm">{formatNotificationType(notification.notification_type)}</p>
                          <p className="text-xs text-gray-500">
                            {notification.sent_at 
                              ? `Sent ${format(new Date(notification.sent_at), 'MMM d, yyyy at h:mm a')}`
                              : `Created ${format(new Date(notification.created_at), 'MMM d, yyyy at h:mm a')}`
                            }
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No player email address available</p>
            <p className="text-sm">Add a player email to send notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionNotificationManager;
