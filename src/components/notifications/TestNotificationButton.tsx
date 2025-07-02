
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { createPaymentDueNotification } from '@/utils/notificationService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const TestNotificationButton = () => {
  const { profile } = useAuth();

  const createTestNotification = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create notifications",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPaymentDueNotification(
        profile.id,
        "Test Tennis Session",
        75,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        "test-session-id"
      );

      toast({
        title: "Test notification created",
        description: "Check the notification bell in the navbar!"
      });
    } catch (error) {
      console.error('Failed to create test notification:', error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive"
      });
    }
  };

  return (
    <Button onClick={createTestNotification} variant="outline" size="sm">
      <Bell className="h-4 w-4 mr-2" />
      Create Test Notification
    </Button>
  );
};

export default TestNotificationButton;
