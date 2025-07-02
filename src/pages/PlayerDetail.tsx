
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, User, CalendarClock, BarChart3, FileEdit } from "lucide-react";
import PlayerGoals from "@/components/players/PlayerGoals";
import PlayerNotes from "@/components/players/PlayerNotes";
import PlayerHistory from "@/components/players/PlayerHistory";
import SimpleProgressTracking from "@/components/players/SimpleProgressTracking";
import PlayerProgressSummary from "@/components/players/PlayerProgressSummary";

const PlayerDetail = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = () => {
      try {
        const playersStr = localStorage.getItem("players");
        if (!playersStr) {
          toast({
            title: "Error",
            description: "No players found",
            variant: "destructive"
          });
          navigate("/players");
          return;
        }

        const players = JSON.parse(playersStr);
        const foundPlayer = players.find(p => p.id === playerId);
        
        if (!foundPlayer) {
          toast({
            title: "Player not found",
            description: "The requested player could not be found",
            variant: "destructive"
          });
          navigate("/players");
          return;
        }
        
        setPlayer(foundPlayer);
      } catch (error) {
        console.error("Error fetching player:", error);
        toast({
          title: "Error",
          description: "Failed to load player details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading player details...</p>
        </div>
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Player not found</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => navigate("/players")}
          >
            Return to Players
          </Button>
        </div>
      </Layout>
    );
  }

  const getSkillColor = () => {
    switch(player.skill) {
      case "Beginner": return "bg-blue-100 text-blue-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/players")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
          <span className={`text-xs px-2 py-1 rounded-full ${getSkillColor()}`}>
            {player.skill}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Player Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Age: {player.age}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                <p>{player.email}</p>
              </div>
              
              {player.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <p>{player.phone}</p>
                </div>
              )}
              
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-3 text-muted-foreground" />
                <p>{player.sessionsCount} sessions completed</p>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${player.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
                
                {player.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${player.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  className="bg-tennis-green-600 hover:bg-tennis-green-700" 
                  asChild
                >
                  <a onClick={() => navigate(`/schedule/new?playerId=${player.id}`)}>
                    <CalendarClock className="h-4 w-4 mr-2" />
                    New Session
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <Tabs defaultValue="progress" className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Player Development</CardTitle>
                  <TabsList>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="progress" className="mt-0">
                  <SimpleProgressTracking player={player} />
                </TabsContent>
                <TabsContent value="notes" className="mt-0">
                  <PlayerNotes player={player} />
                </TabsContent>
                <TabsContent value="goals" className="mt-0">
                  <PlayerGoals player={player} />
                </TabsContent>
                <TabsContent value="history" className="mt-0">
                  <PlayerHistory player={player} />
                </TabsContent>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/players/${player.id}/edit`)}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit Player Profile
                </Button>
              </CardFooter>
            </Tabs>
          </Card>
        </div>

        {/* Progress Summary Sidebar */}
        <div className="md:hidden">
          <PlayerProgressSummary player={player} />
        </div>
      </div>
    </Layout>
  );
};

export default PlayerDetail;
