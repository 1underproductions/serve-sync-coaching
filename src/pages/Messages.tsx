
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Search } from "lucide-react";

// Mock data for demonstration
const messages = [
  {
    id: "1",
    sender: "Michael Johnson",
    email: "michael@example.com",
    preview: "Quick question about tomorrow's session...",
    time: "Today, 2:15 PM",
    unread: true,
  },
  {
    id: "2",
    sender: "Sarah Williams",
    email: "sarah@example.com",
    preview: "Thank you for the session today, I learned a lot about...",
    time: "Today, 11:30 AM",
    unread: true,
  },
  {
    id: "3",
    sender: "David Smith",
    email: "david@example.com",
    preview: "I need to reschedule our session next week because...",
    time: "Yesterday, 5:45 PM",
    unread: true,
  },
  {
    id: "4",
    sender: "Emma Wilson",
    email: "emma@example.com",
    preview: "Looking forward to focusing on my backhand during our next...",
    time: "Jul 22, 2023",
    unread: false,
  },
  {
    id: "5",
    sender: "Robert Brown",
    email: "robert@example.com",
    preview: "I wanted to let you know that my son really enjoyed...",
    time: "Jul 21, 2023",
    unread: false,
  },
];

const Messages = () => {
  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground mt-1">Communicate with your players and parents</p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/messages/new">
              <Plus className="h-4 w-4 mr-2" /> New Message
            </Link>
          </Button>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2 mb-2">
          <Input type="text" placeholder="Search messages..." className="w-full" />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {messages.map((message) => (
            <Card key={message.id} className={`card-hover ${message.unread ? 'border-l-4 border-l-tennis-green-500' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-tennis-blue-100 text-tennis-blue-800">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {message.sender}
                        {message.unread && (
                          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-tennis-green-500"></span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">{message.email}</CardDescription>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{message.time}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">{message.preview}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={`/message/${message.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Read Full Message
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
