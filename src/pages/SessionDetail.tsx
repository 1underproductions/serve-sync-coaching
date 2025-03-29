
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, MapPin, User, ArrowRight } from "lucide-react";
import SessionNotes from "@/components/session/SessionNotes";
import SessionFeedback from "@/components/session/SessionFeedback";
import CoachingPlan from "@/components/session/CoachingPlan";
import ProgressTracking from "@/components/session/ProgressTracking";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the active tab from query params or default to "notes"
  const activeTab = searchParams.get("tab") || "notes";

  useEffect(() => {
    const fetchSessionAndPlayer = () => {
      try {
        // Fetch session
        const sessionsStr = localStorage.getItem("sessions");
        if (!sessionsStr) {
          toast({
            title: "Error",
            description: "No sessions found",
            variant: "destructive"
          });
          navigate("/schedule");
          return;
        }

        const sessions = JSON.parse(sessionsStr);
        const foundSession = sessions.find(s => s.id === sessionId);
        
        if (!foundSession) {
          toast({
            title: "Session not found",
            description: "The requested session could not be found",
            variant: "destructive"
          });
          navigate("/schedule");
          return;
        }
        
        setSession(foundSession);
        
        // Fetch player
        const playersStr = localStorage.getItem("players");
        if (!playersStr) return;
        
        const players = JSON.parse(playersStr);
        const foundPlayer = players.find(p => p.id === foundSession.playerId);
        
        if (foundPlayer) {
          setPlayer(foundPlayer);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load session details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndPlayer();
  }, [sessionId, navigate]);

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Function to handle tab change and update URL
  const handleTabChange = (value) => {
    navigate(`/session/${sessionId}?tab=${value}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading session details...</p>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Session not found</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate("/schedule")}
          >
            Return to Schedule
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/schedule")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{session.title}</h1>
          <span className={`text-xs px-2 py-1 rounded-full ${
            session.type === "individual"
              ? "bg-tennis-green-100 text-tennis-green-800"
              : session.type === "group"
                ? "bg-tennis-blue-100 text-tennis-blue-800"
                : "bg-orange-100 text-orange-800"
          }`}>
            {session.type === "individual" 
              ? "Individual" 
              : session.type === "group" 
                ? "Group" 
                : "Tournament"}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {player && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      <Link to={`/players/${player.id}`} className="hover:underline">
                        {player.name}
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {player.skill} • {player.age} years old
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                <p>{formatDate(session.date)}</p>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                <p>{session.startTime} - {session.endTime}</p>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                <p>{session.location}</p>
              </div>

              <div className="flex flex-col space-y-2 mt-6">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/session/${session.id}/edit`}>Edit Session</Link>
                </Button>
                {player && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    asChild
                  >
                    <Link to={`/players/${player.id}`}>
                      <User className="h-4 w-4 mr-2" />
                      View Player Profile
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <Tabs 
              defaultValue={activeTab} 
              className="w-full"
              onValueChange={handleTabChange}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Session Management</CardTitle>
                  <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="plan">Coaching Plan</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="notes" className="mt-0">
                  <SessionNotes session={session} />
                </TabsContent>
                <TabsContent value="feedback" className="mt-0">
                  <SessionFeedback session={session} player={player} />
                </TabsContent>
                <TabsContent value="plan" className="mt-0">
                  <CoachingPlan session={session} player={player} />
                </TabsContent>
                <TabsContent value="progress" className="mt-0">
                  <ProgressTracking session={session} player={player} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SessionDetail;
