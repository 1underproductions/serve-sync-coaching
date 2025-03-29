
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CheckCircle, Users, User, PlusCircle } from "lucide-react";

// Schema for individual message
const individualMessageSchema = z.object({
  recipient: z.string().min(1, { message: "Recipient is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(1, { message: "Message is required" }),
});

// Schema for group message
const groupMessageSchema = z.object({
  groupType: z.enum(["existing", "new"]),
  existingGroup: z.string().optional(),
  newGroupName: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(1, { message: "Message is required" }),
}).refine(data => {
  // If groupType is existing, existingGroup is required
  if (data.groupType === "existing" && !data.existingGroup) {
    return false;
  }
  // If groupType is new, newGroupName is required
  if (data.groupType === "new" && !data.newGroupName) {
    return false;
  }
  return true;
}, {
  message: "Please select an existing group or provide a name for the new group",
  path: ["existingGroup"],
});

// Mock data for recipients and groups
const mockPlayers = [
  { id: "1", name: "Michael Johnson", email: "michael@example.com" },
  { id: "2", name: "Sarah Williams", email: "sarah@example.com" },
  { id: "3", name: "David Smith", email: "david@example.com" },
  { id: "4", name: "Emma Wilson", email: "emma@example.com" },
];

const mockGroups = [
  { id: "1", name: "Beginners Group", members: 8 },
  { id: "2", name: "Advanced Team", members: 6 },
  { id: "3", name: "Junior Competition Team", members: 12 },
];

const NewMessage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messageType, setMessageType] = useState<"individual" | "group">("individual");
  
  // Individual message form
  const individualForm = useForm<z.infer<typeof individualMessageSchema>>({
    resolver: zodResolver(individualMessageSchema),
    defaultValues: {
      recipient: "",
      subject: "",
      message: "",
    },
  });
  
  // Group message form
  const groupForm = useForm<z.infer<typeof groupMessageSchema>>({
    resolver: zodResolver(groupMessageSchema),
    defaultValues: {
      groupType: "existing",
      existingGroup: "",
      newGroupName: "",
      subject: "",
      message: "",
    },
  });
  
  const groupType = groupForm.watch("groupType");

  const onSubmitIndividual = (data: z.infer<typeof individualMessageSchema>) => {
    console.log("Individual message data:", data);
    
    // In a real app, this would send the message to the backend
    toast({
      title: "Message Sent",
      description: `Your message has been sent to ${data.recipient}. Client replies will be captured in the portal.`,
    });
    
    navigate("/messages");
  };
  
  const onSubmitGroup = (data: z.infer<typeof groupMessageSchema>) => {
    console.log("Group message data:", data);
    
    const groupName = data.groupType === "existing" 
      ? mockGroups.find(g => g.id === data.existingGroup)?.name 
      : data.newGroupName;
    
    // In a real app, this would send the message to the backend
    toast({
      title: "Group Message Sent",
      description: `Your message has been sent to ${groupName}. All replies will be captured in the thread.`,
    });
    
    navigate("/messages");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">New Message</h1>
          <p className="text-muted-foreground mt-1">Send a message to a player, parent, or team</p>
        </div>
        
        <Tabs defaultValue="individual" onValueChange={(value) => setMessageType(value as "individual" | "group")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Individual
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Group/Team
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual">
            <Card>
              <CardHeader>
                <CardTitle>Individual Message</CardTitle>
                <CardDescription>
                  Send a message to a single player or parent. They'll receive it via email and can reply directly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...individualForm}>
                  <form onSubmit={individualForm.handleSubmit(onSubmitIndividual)} className="space-y-6">
                    <FormField
                      control={individualForm.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a recipient" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockPlayers.map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                  {player.name} ({player.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={individualForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter message subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={individualForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Type your message here..." 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The recipient will receive this message by email and can reply directly. Replies will be captured in the portal.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate("/messages")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-tennis-green-600 hover:bg-tennis-green-700"
                      >
                        Send Message
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="group">
            <Card>
              <CardHeader>
                <CardTitle>Group/Team Message</CardTitle>
                <CardDescription>
                  Send a message to an existing group or create a new one. All members will receive the message.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...groupForm}>
                  <form onSubmit={groupForm.handleSubmit(onSubmitGroup)} className="space-y-6">
                    <FormField
                      control={groupForm.control}
                      name="groupType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="existing">Existing Group/Team</SelectItem>
                              <SelectItem value="new">Create New Group</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {groupType === "existing" ? (
                      <FormField
                        control={groupForm.control}
                        name="existingGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Group</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name} ({group.members} members)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={groupForm.control}
                        name="newGroupName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Group Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter group name" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormDescription>
                              You'll be able to add members after creating the group.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={groupForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter message subject" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={groupForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Type your message here..." 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            All group members will receive this message by email and can reply directly. Replies will be captured in the thread.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate("/messages")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-tennis-green-600 hover:bg-tennis-green-700"
                      >
                        Send to Group
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="bg-muted/40 border-dashed mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-start">
              <div className="bg-tennis-blue-100 text-tennis-blue-700 p-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Email Integration</h3>
                <p className="text-sm text-muted-foreground">
                  The system creates a unique tracking ID for each conversation, allowing client email replies to be captured and displayed in the portal. 
                  This works regardless of whether they are replying to an individual or group message.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewMessage;
