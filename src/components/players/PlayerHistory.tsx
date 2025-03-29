
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, BarChart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const PlayerHistory = ({ player }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayerSessions = () => {
      try {
        // Get all sessions from localStorage
        const sessionsStr = localStorage.getItem("sessions");
        if (!sessionsStr) {
          setLoading(false);
          return;
        }
        
        const allSessions = JSON.parse(sessionsStr);
        
        // Filter sessions for this player
        const playerSessions = allSessions.filter(
          session => session.playerId === player.id || 
                    (session.players && session.players.includes(player.id))
        );
        
        // Sort by date (newest first)
        playerSessions.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setSessions(playerSessions);
      } catch (error) {
        console.error("Error fetching player sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerSessions();
  }, [player.id]);

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading session history...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-md">
        <p className="text-muted-foreground">No session history found for this player.</p>
        <Button 
          className="mt-4 bg-tennis-green-600 hover:bg-tennis-green-700"
          onClick={() => navigate(`/schedule/new?playerId=${player.id}`)}
        >
          Schedule First Session
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Session History</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/schedule/new?playerId=${player.id}`)}
        >
          Schedule New Session
        </Button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/session/${session.id}`)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{session.title}</h4>
                  
                  <div className="flex flex-col sm:flex-row sm:gap-4 mt-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(session.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    session.type === "individual"
                      ? "bg-tennis-green-100 text-tennis-green-800"
                      : session.type === "group"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                  }`}>
                    {session.type === "individual" 
                      ? "Individual" 
                      : session.type === "group" 
                        ? "Group" 
                        : "Tournament"}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-3">
                <Button variant="ghost" size="sm" className="h-8" asChild>
                  <div onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/session/${session.id}?tab=notes`);
                  }}>
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    Notes
                  </div>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8" asChild>
                  <div onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/session/${session.id}?tab=progress`);
                  }}>
                    <BarChart className="h-3.5 w-3.5 mr-1.5" />
                    Progress
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerHistory;
