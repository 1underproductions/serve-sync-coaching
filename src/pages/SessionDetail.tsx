
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react";
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
      <div className="mb-6">
        <Button variant="outline" size="icon" className="mr-3" onClick={() => navigate("/schedule")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className={`text-xs px-2 py-1 rounded-full align-middle mr-3 ${
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Session Details Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold">Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {player && (
              <div className="flex items-start">
                <User className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold text-lg">
                    <Link to={`/players/${player.id}`} className="hover:underline">
                      {player.name}
                    </Link>
                  </p>
                  <p className="text-muted-foreground">
                    {player.skill} • {player.age} years old
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
              <p>{formatDate(session.date)}</p>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
              <p>{session.startTime} - {session.endTime}</p>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
              <p>{session.location}</p>
            </div>

            <div className="flex flex-col space-y-3 mt-8">
              <Button variant="outline" size="lg" className="justify-center w-full">
                Edit Session
              </Button>
              
              {player && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="justify-center w-full"
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

        {/* Session Management Card */}
        <div className="md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">Session Management</CardTitle>
            </CardHeader>
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={handleTabChange}
              className="w-full"
            >
              <div className="px-6 border-b">
                <TabsList className="bg-transparent p-0 h-12 w-full justify-start space-x-6">
                  <TabsTrigger 
                    value="notes" 
                    className="py-3 px-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-tennis-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="feedback" 
                    className="py-3 px-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-tennis-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                  >
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger 
                    value="plan" 
                    className="py-3 px-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-tennis-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                  >
                    Coaching Plan
                  </TabsTrigger>
                  <TabsTrigger 
                    value="progress" 
                    className="py-3 px-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-tennis-green-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                  >
                    Progress
                  </TabsTrigger>
                </TabsList>
              </div>
              <CardContent className="pt-6">
                <TabsContent value="notes" className="mt-0 p-0">
                  <SessionNotes session={session} />
                </TabsContent>
                <TabsContent value="feedback" className="mt-0 p-0">
                  <SessionFeedback session={session} player={player} />
                </TabsContent>
                <TabsContent value="plan" className="mt-0 p-0">
                  <CoachingPlan session={session} player={player} />
                </TabsContent>
                <TabsContent value="progress" className="mt-0 p-0">
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
