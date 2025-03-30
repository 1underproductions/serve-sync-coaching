
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enableRegistration: true,
    requireEmailVerification: true,
    allowFreeTrials: true,
    automaticPaymentReminders: true,
    stripeLiveMode: false,
    debugMode: false,
  });

  const [stripeSettings, setStripeSettings] = useState({
    publishableKey: "pk_test_51ABcDE...",
    secretKey: "sk_test_51ABcDE...",
    webhookSecret: "whsec_12345...",
  });

  const [emailSettings, setEmailSettings] = useState({
    fromEmail: "noreply@servesync.com",
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "apikey",
    smtpPassword: "••••••••••••••••",
  });

  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
    
    toast({
      title: "Setting updated",
      description: `${setting} is now ${!settings[setting] ? "enabled" : "disabled"}`,
    });
  };

  const handleSaveStripeSettings = () => {
    toast({
      title: "Stripe settings saved",
      description: "Your payment configuration has been updated",
    });
  };

  const handleSaveEmailSettings = () => {
    toast({
      title: "Email settings saved",
      description: "Your email configuration has been updated",
    });
  };

  return (
    <AdminLayout>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Control how your platform operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">User Registration</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register on the platform
                  </p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={() => handleSettingToggle("enableRegistration")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Email Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={() => handleSettingToggle("requireEmailVerification")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Free Trials</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to access a 14-day free trial
                  </p>
                </div>
                <Switch
                  checked={settings.allowFreeTrials}
                  onCheckedChange={() => handleSettingToggle("allowFreeTrials")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Debug Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable additional logging and debug information
                  </p>
                </div>
                <Switch
                  checked={settings.debugMode}
                  onCheckedChange={() => handleSettingToggle("debugMode")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Integration</CardTitle>
              <CardDescription>
                Configure your payment processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Live Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable live payments (disable for testing)
                  </p>
                </div>
                <Switch
                  checked={settings.stripeLiveMode}
                  onCheckedChange={() => handleSettingToggle("stripeLiveMode")}
                />
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="publishableKey">Publishable Key</Label>
                  <Input
                    id="publishableKey"
                    value={stripeSettings.publishableKey}
                    onChange={(e) => setStripeSettings({...stripeSettings, publishableKey: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={stripeSettings.secretKey}
                    onChange={(e) => setStripeSettings({...stripeSettings, secretKey: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={stripeSettings.webhookSecret}
                    onChange={(e) => setStripeSettings({...stripeSettings, webhookSecret: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleSaveStripeSettings}>
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure your email delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-medium">Automatic Payment Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    Send automatic reminders for upcoming payments
                  </p>
                </div>
                <Switch
                  checked={settings.automaticPaymentReminders}
                  onCheckedChange={() => handleSettingToggle("automaticPaymentReminders")}
                />
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleSaveEmailSettings}>
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
