
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserIcon, 
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import SessionNotes from "@/components/session/SessionNotes";
import CoachingPlan from "@/components/session/CoachingPlan";
import ProgressTracking from "@/components/session/ProgressTracking";
import SessionFeedback from "@/components/session/SessionFeedback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionDetail = () => {
      try {
        const sessionsStr = localStorage.getItem("sessions");
        if (sessionsStr) {
          const sessions = JSON.parse(sessionsStr);
          const foundSession = sessions.find((s) => s.id === sessionId);
          
          if (foundSession) {
            setSession(foundSession);
          } else {
            toast({
              variant: "destructive",
              title: "Not found",
              description: "Session does not exist",
            });
            navigate("/schedule");
          }
        } else {
          toast({
            title: "No sessions",
            description: "You don't have any sessions yet",
          });
          navigate("/schedule");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load session details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetail();
  }, [sessionId, navigate]);

  const handleDeleteSession = () => {
    try {
      const sessionsStr = localStorage.getItem("sessions");
      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        const updatedSessions = sessions.filter((s) => s.id !== sessionId);
        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        
        toast({
          title: "Session deleted",
          description: "The session has been removed from your schedule",
        });
        
        navigate("/schedule");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the session",
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
    } catch (e) {
      // If dateString is a Date object
      try {
        return format(new Date(dateString), "EEEE, MMMM d, yyyy");
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid date";
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/schedule")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="animate-pulse bg-gray-200 h-7 w-3/4 rounded mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-1/2 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="bg-gray-200 h-6 w-full rounded"></div>
                <div className="bg-gray-200 h-6 w-full rounded"></div>
                <div className="bg-gray-200 h-6 w-full rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/schedule")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Session Not Found</h1>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-semibold mb-2">
                The requested session could not be found
              </h2>
              <p className="text-muted-foreground mb-6">
                The session may have been deleted or you may have followed an invalid link.
              </p>
              <Button onClick={() => navigate("/schedule")}>
                Return to Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/schedule")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{session.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/session/${sessionId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this session? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSession}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>
                  {session.type && (
                    <Badge className="mt-2" variant="outline">
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session
                    </Badge>
                  )}
                </CardDescription>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-tennis-green-50 text-tennis-green-700 border-tennis-green-200 hover:bg-tennis-green-100"
                onClick={() => navigate(`/payments/new?sessionId=${sessionId}`)}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Create Payment Link
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {typeof session.date === "string"
                      ? formatDate(session.date)
                      : formatDate(session.date)}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span>{session.location}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>Player: {session.playerName || session.player || "Not specified"}</span>
                </div>
                {session.isRecurring && (
                  <div className="flex items-start text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2 mt-0.5" />
                    <span>
                      This is a recurring session that repeats weekly.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="notes">Session Notes</TabsTrigger>
            <TabsTrigger value="plan">Coaching Plan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <SessionNotes session={session} />
          </TabsContent>
          <TabsContent value="plan">
            <CoachingPlan session={session} player={session.player} />
          </TabsContent>
          <TabsContent value="progress">
            <ProgressTracking session={session} player={session.player} />
          </TabsContent>
          <TabsContent value="feedback">
            <SessionFeedback session={session} player={session.player} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SessionDetail;
