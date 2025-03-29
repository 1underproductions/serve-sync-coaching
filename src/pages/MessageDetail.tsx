
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Users, Paperclip } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock messages data
const mockMessages = {
  "1": {
    id: "1",
    sender: "Michael Johnson",
    email: "michael@example.com",
    subject: "Question about tomorrow's session",
    type: "individual",
    messages: [
      {
        id: "1-1",
        from: "Michael Johnson",
        email: "michael@example.com",
        content: "Hi Coach, I was wondering if we're still on for tomorrow's session? The weather forecast doesn't look great and I wanted to check if we'll be moving indoors or rescheduling. Thanks!",
        date: "Today, 2:15 PM",
        isClient: true
      }
    ]
  },
  "3": {
    id: "3",
    sender: "Beginners Group",
    participants: 8,
    subject: "Change of venue for Saturday's group session",
    type: "group",
    messages: [
      {
        id: "3-1",
        from: "Coach",
        email: "coach@tennisapp.com",
        content: "Hi everyone, Due to maintenance at our usual courts, this Saturday's beginners group session will be held at Central Park Tennis Courts instead. The time remains the same (10am-12pm). Please let me know if you have any questions or if anyone will have trouble making it to the new location. See you all there!",
        date: "Yesterday, 3:30 PM",
        isClient: false
      },
      {
        id: "3-2",
        from: "David Miller",
        email: "david@example.com",
        content: "Thanks for letting us know! Central Park is actually closer for me, so that works out better.",
        date: "Yesterday, 4:15 PM",
        isClient: true
      },
      {
        id: "3-3",
        from: "Lisa Wong",
        email: "lisa@example.com",
        content: "Will there be parking available at the new courts?",
        date: "Yesterday, 5:20 PM",
        isClient: true
      },
      {
        id: "3-4",
        from: "Coach",
        email: "coach@tennisapp.com",
        content: "Yes, there's a parking lot right next to the courts. There should be plenty of spaces at that time of day.",
        date: "Yesterday, 5:45 PM",
        isClient: false
      }
    ]
  }
};

const MessageDetail = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reply, setReply] = useState("");
  
  // Get message data by ID
  const messageData = messageId ? mockMessages[messageId] : null;
  
  if (!messageData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-semibold mb-4">Message Not Found</h1>
          <p className="text-muted-foreground mb-6">The message you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate("/messages")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Messages
          </Button>
        </div>
      </Layout>
    );
  }

  const handleSendReply = () => {
    if (!reply.trim()) return;
    
    // In a real app, this would send the reply to the backend
    toast({
      title: "Reply Sent",
      description: messageData.type === "group" 
        ? "Your response has been sent to all group members."
        : `Your response has been sent to ${messageData.sender}.`,
    });
    
    setReply("");
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{messageData.subject}</h1>
          {messageData.type === "group" && (
            <Badge variant="secondary">Group Thread</Badge>
          )}
        </div>
        
        <div className="mb-6">
          {messageData.type === "group" ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-tennis-blue-100 text-tennis-blue-800">
                  <Users className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{messageData.sender}</p>
                <p className="text-sm text-muted-foreground">{messageData.participants} participants</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-tennis-blue-100 text-tennis-blue-800">
                  {messageData.sender.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{messageData.sender}</p>
                <p className="text-sm text-muted-foreground">{messageData.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {messageData.messages.map((msg) => (
            <Card 
              key={msg.id} 
              className={msg.isClient ? "border-l-4 border-l-tennis-blue-500" : "bg-muted/30"}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback 
                        className={msg.isClient 
                          ? "bg-tennis-blue-100 text-tennis-blue-800" 
                          : "bg-tennis-green-100 text-tennis-green-800"
                        }
                      >
                        {msg.isClient ? msg.from.split(' ').map(n => n[0]).join('') : "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{msg.from}</CardTitle>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{msg.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-medium mb-2">Reply</h3>
          <div className="flex flex-col space-y-4">
            <Textarea 
              placeholder={messageData.type === "group" 
                ? "Type your reply to the group..." 
                : `Type your reply to ${messageData.sender}...`
              }
              className="min-h-[120px]"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="flex justify-between">
              <Button variant="outline" type="button" className="gap-2">
                <Paperclip className="h-4 w-4" />
                Attach Files
              </Button>
              <Button 
                onClick={handleSendReply}
                className="bg-tennis-green-600 hover:bg-tennis-green-700 gap-2"
                disabled={!reply.trim()}
              >
                <Send className="h-4 w-4" />
                Send Reply
              </Button>
            </div>
          </div>
        </div>
        
        <Card className="bg-muted/40 border-dashed mt-4">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong>Email ID:</strong> {messageId}-{Math.floor(Math.random() * 10000)}
              <br />
              Replies to this message will be synced to this conversation automatically, whether sent from this portal or via email.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MessageDetail;
