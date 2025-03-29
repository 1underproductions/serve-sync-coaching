
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BellRing, Key, Mail, Smartphone, Shield, Save, Award, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  emailBookingConfirmation: z.boolean(),
  emailReminders: z.boolean(),
  smsReminders: z.boolean(),
  marketingEmails: z.boolean(),
});

const qualificationFormSchema = z.object({
  coachingLevel: z.string().optional(),
  newQualification: z.string().optional(),
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type QualificationFormValues = z.infer<typeof qualificationFormSchema>;

// Sample qualification types that could be used
const qualificationTypes = [
  { label: "LTA Level 1", value: "lta-level-1" },
  { label: "LTA Level 2", value: "lta-level-2" },
  { label: "LTA Level 3", value: "lta-level-3" },
  { label: "LTA Level 4", value: "lta-level-4" },
  { label: "LTA Level 5", value: "lta-level-5" },
  { label: "PTR Professional", value: "ptr-professional" },
  { label: "PTR Master Professional", value: "ptr-master" },
  { label: "ITF Level 1", value: "itf-level-1" },
  { label: "ITF Level 2", value: "itf-level-2" },
  { label: "ITF Level 3", value: "itf-level-3" },
  { label: "USPTA Professional", value: "uspta-professional" },
  { label: "USPTA Elite Professional", value: "uspta-elite" },
  { label: "USPTA Master Professional", value: "uspta-master" },
  { label: "First Aid Certified", value: "first-aid" },
  { label: "CPR Certified", value: "cpr" },
  { label: "Safeguarding Trained", value: "safeguarding" },
  { label: "Other", value: "other" },
];

const Settings = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [qualifications, setQualifications] = useState<string[]>([
    "LTA Level 3",
    "First Aid Certified",
    "Safeguarding Trained"
  ]);
  const [activeCoachingLevel, setActiveCoachingLevel] = useState("lta-level-3");

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      emailBookingConfirmation: true,
      emailReminders: true,
      smsReminders: false,
      marketingEmails: false,
    },
  });

  const qualificationForm = useForm<QualificationFormValues>({
    resolver: zodResolver(qualificationFormSchema),
    defaultValues: {
      coachingLevel: "lta-level-3",
      newQualification: "",
    },
  });

  const onPasswordSubmit = (data: PasswordFormValues) => {
    toast({
      title: "Password updated",
      description: "Your password has been successfully updated.",
    });
    console.log("Password data:", data);
    passwordForm.reset();
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification preferences have been successfully updated.",
    });
    console.log("Notification data:", data);
  };

  const onQualificationSubmit = (data: QualificationFormValues) => {
    if (data.coachingLevel && data.coachingLevel !== activeCoachingLevel) {
      setActiveCoachingLevel(data.coachingLevel);
      toast({
        title: "Coaching level updated",
        description: `Your primary coaching level has been updated to ${qualificationTypes.find(q => q.value === data.coachingLevel)?.label || data.coachingLevel}.`,
      });
    }
    qualificationForm.reset({
      coachingLevel: data.coachingLevel,
      newQualification: "",
    });
  };

  const addQualification = () => {
    const newQual = qualificationForm.getValues("newQualification");
    if (newQual && !qualifications.includes(newQual)) {
      setQualifications([...qualifications, newQual]);
      toast({
        title: "Qualification added",
        description: `${newQual} has been added to your qualifications.`,
      });
      qualificationForm.reset({ 
        coachingLevel: activeCoachingLevel,
        newQualification: "",
      });
    }
  };

  const removeQualification = (qual: string) => {
    setQualifications(qualifications.filter(q => q !== qual));
    toast({
      title: "Qualification removed",
      description: `${qual} has been removed from your qualifications.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-6">
          {/* New Coaching Qualifications Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-tennis-green-600" />
                  <span>Coaching Qualifications</span>
                </div>
              </CardTitle>
              <CardDescription>
                Manage your coaching levels, certifications, and qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...qualificationForm}>
                <form onSubmit={qualificationForm.handleSubmit(onQualificationSubmit)} className="space-y-6">
                  <FormField
                    control={qualificationForm.control}
                    name="coachingLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Coaching Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary coaching level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {qualificationTypes
                              .filter(type => type.value.includes('level') || type.value.includes('professional'))
                              .map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This is your primary coaching qualification that will be displayed on your profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h4 className="mb-2 font-medium">Current Qualifications & Certifications</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {qualifications.length > 0 ? (
                        qualifications.map(qual => (
                          <Badge key={qual} className="flex items-center gap-1 bg-tennis-green-100 text-tennis-green-800 hover:bg-tennis-green-200">
                            {qual}
                            <button
                              type="button"
                              onClick={() => removeQualification(qual)}
                              className="ml-1 rounded-full hover:bg-tennis-green-200 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No qualifications added yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end gap-2">
                    <FormField
                      control={qualificationForm.control}
                      name="newQualification"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Add Qualification</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CPR Certified, Tournament Director" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="icon" 
                      onClick={addQualification}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="ml-auto" variant="tennis">
                      <Save className="mr-2 h-4 w-4" />
                      Save Qualifications
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="ml-auto" variant="tennis">
                      <Key className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium leading-none">
                        Two-factor authentication
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isOpen ? "Cancel" : "Setup"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h4 className="text-sm font-medium">Authenticator App</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use an authenticator app like Google Authenticator, Microsoft
                      Authenticator, or 1Password to get two-factor authentication codes
                      when prompted.
                    </p>
                    <Button className="mt-4" variant="secondary" size="sm">
                      Set up authenticator app
                    </Button>
                  </div>
                  <div className="rounded-md border p-4">
                    <h4 className="text-sm font-medium">Text Message</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We'll send a code to your phone when you sign in.
                    </p>
                    <Button className="mt-4" variant="secondary" size="sm">
                      Set up text message
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium leading-none">
                            Email Notifications
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium leading-none">
                            SMS Notifications
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via text message
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-6">
                    <h3 className="mb-4 text-sm font-medium">Notification Preferences</h3>
                    <div className="grid gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailBookingConfirmation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0">
                            <FormLabel className="flex-1">
                              Booking confirmations
                              <FormDescription>
                                Receive an email when a player books a session
                              </FormDescription>
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="emailReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0">
                            <FormLabel className="flex-1">
                              Email reminders
                              <FormDescription>
                                Receive email reminders about upcoming sessions
                              </FormDescription>
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="smsReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0">
                            <FormLabel className="flex-1">
                              SMS reminders
                              <FormDescription>
                                Receive SMS reminders about upcoming sessions
                              </FormDescription>
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0">
                            <FormLabel className="flex-1">
                              Marketing emails
                              <FormDescription>
                                Receive emails about new features and updates
                              </FormDescription>
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <CardFooter className="px-0 pt-4">
                    <Button type="submit" className="ml-auto" variant="tennis">
                      <BellRing className="mr-2 h-4 w-4" />
                      Save Preferences
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
