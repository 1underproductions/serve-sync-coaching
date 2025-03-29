
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Search, Users, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for demonstration
const messages = [
  {
    id: "1",
    sender: "Michael Johnson",
    email: "michael@example.com",
    preview: "Quick question about tomorrow's session...",
    time: "Today, 2:15 PM",
    unread: true,
    type: "individual",
  },
  {
    id: "2",
    sender: "Sarah Williams",
    email: "sarah@example.com",
    preview: "Thank you for the session today, I learned a lot about...",
    time: "Today, 11:30 AM",
    unread: true,
    type: "individual",
  },
  {
    id: "3",
    sender: "Beginners Group",
    participants: 8,
    preview: "Change of venue for Saturday's group session...",
    time: "Yesterday, 3:30 PM",
    unread: true,
    type: "group",
  },
  {
    id: "4",
    sender: "Advanced Team",
    participants: 6,
    preview: "Tournament schedule and practice times for next week...",
    time: "Yesterday, 12:15 PM",
    unread: false,
    type: "group",
  },
  {
    id: "5",
    sender: "David Smith",
    email: "david@example.com",
    preview: "I need to reschedule our session next week because...",
    time: "Yesterday, 5:45 PM",
    unread: false,
    type: "individual",
  },
  {
    id: "6",
    sender: "Emma Wilson",
    email: "emma@example.com",
    preview: "Looking forward to focusing on my backhand during our next...",
    time: "Jul 22, 2023",
    unread: false,
    type: "individual",
  },
  {
    id: "7",
    sender: "Junior Competition Team",
    participants: 12,
    preview: "Important update about the upcoming tournament registration...",
    time: "Jul 21, 2023",
    unread: false,
    type: "group",
  },
];

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const filteredMessages = messages.filter(message => {
    // Apply search filter
    const searchMatch = 
      message.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.preview?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (message.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Apply message type filter
    const typeMatch = 
      filterType === "all" || 
      (filterType === "individual" && message.type === "individual") ||
      (filterType === "group" && message.type === "group");
      
    return searchMatch && typeMatch;
  });

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground mt-1">Communicate with your players, parents, and teams</p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/messages/new">
              <Plus className="h-4 w-4 mr-2" /> New Message
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Groups & Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No messages found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <Card key={message.id} className={`card-hover ${message.unread ? 'border-l-4 border-l-tennis-green-500' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        {message.type === "group" ? (
                          <AvatarFallback className="bg-tennis-blue-100 text-tennis-blue-800">
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-tennis-blue-100 text-tennis-blue-800">
                            {message.sender.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {message.sender}
                            {message.unread && (
                              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-tennis-green-500"></span>
                            )}
                          </CardTitle>
                          {message.type === "group" && (
                            <Badge variant="secondary" className="text-xs">
                              {message.participants} members
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {message.type === "individual" ? message.email : "Group Message"}
                        </CardDescription>
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
                      <MessageSquare className="h-4 w-4 mr-2" /> {message.type === "group" ? "View Thread" : "Read Full Message"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Email reply information */}
        <Card className="bg-muted/50 mt-4">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-tennis-blue-100 p-3 rounded-full">
                <MessageSquare className="h-5 w-5 text-tennis-blue-700" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Email Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Clients can reply directly to your messages via email. All responses will be automatically captured in this portal.
                  Each message includes a unique reference code that helps us route replies to the correct conversation thread.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Messages;
