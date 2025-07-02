
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import NewSessionForm from "@/components/schedule/NewSessionForm";
import SessionPaymentManager from "@/components/schedule/SessionPaymentManager";
import SessionNotificationManager from "@/components/schedule/SessionNotificationManager";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SessionEdit = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = () => {
      try {
        const sessionsStr = localStorage.getItem("sessions");
        if (sessionsStr) {
          const sessions = JSON.parse(sessionsStr);
          const foundSession = sessions.find(s => s.id === sessionId);
          if (foundSession) {
            setSession(foundSession);
          } else {
            toast({
              title: "Session not found",
              description: "The requested session could not be found.",
              variant: "destructive"
            });
            navigate("/schedule");
          }
        } else {
          toast({
            title: "No sessions",
            description: "There are no sessions saved in the system.",
            variant: "destructive"
          });
          navigate("/schedule");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error",
          description: "Failed to load session details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, navigate]);

  const handleSessionUpdated = () => {
    toast({
      title: "Session updated",
      description: "The session has been successfully updated.",
    });
    
    // Dispatch custom event to notify other components of session updates
    window.dispatchEvent(new CustomEvent('sessionsUpdated'));
    
    navigate("/schedule");
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/schedule")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Session</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <p>Loading session details...</p>
          </div>
        ) : session ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Session Details</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <NewSessionForm 
                    key={session.id} 
                    initialData={session} 
                    onSessionCreated={handleSessionUpdated} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-6">
              <SessionPaymentManager
                sessionId={session.id}
                sessionDetails={{
                  title: session.title,
                  date: session.date,
                  startTime: session.startTime,
                  player: session.player,
                  playerEmail: session.playerEmail,
                  location: session.location
                }}
                coachName="Coach" // You might want to get this from user context
              />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <SessionNotificationManager
                sessionId={session.id}
                sessionDetails={{
                  title: session.title,
                  date: session.date,
                  startTime: session.startTime,
                  player: session.player,
                  playerEmail: session.playerEmail,
                  location: session.location
                }}
                coachName="Coach" // You might want to get this from user context
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Session not found</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => navigate("/schedule")}
            >
              Return to Schedule
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SessionEdit;
