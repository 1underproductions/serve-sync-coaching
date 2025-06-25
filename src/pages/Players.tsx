import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, UserPlus, ChartLine, FileText } from "lucide-react";
import PlayerCard from "@/components/players/PlayerCard";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import ProgressTracking from "@/components/session/ProgressTracking";
import { Badge } from "@/components/ui/badge";

// Define the Player type
interface Player {
  id: string;
  name: string;
  skill: string;
  age: number;
  email?: string;
  sessionsCount: number;
  phone?: string;
  notes?: string;
  isChild?: boolean;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const loadPlayers = () => {
    // Load players from localStorage
    const storedPlayers = localStorage.getItem("players");
    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    } else {
      // If no players in localStorage, set mock data for first-time users
      const mockPlayers = [
        { id: "1", name: "Michael Johnson", skill: "Intermediate", age: 28, email: "michael@example.com", sessionsCount: 12 },
        { id: "2", name: "Sarah Williams", skill: "Advanced", age: 24, email: "sarah@example.com", sessionsCount: 24 },
        { id: "3", name: "David Smith", skill: "Beginner", age: 32, email: "david@example.com", sessionsCount: 5 },
        { 
          id: "4", 
          name: "Emma Brown", 
          skill: "Beginner", 
          age: 10, 
          sessionsCount: 3,
          isChild: true,
          parentName: "John Brown",
          parentEmail: "john.brown@example.com",
          parentPhone: "(555) 987-6543"
        },
      ];
      localStorage.setItem("players", JSON.stringify(mockPlayers));
      setPlayers(mockPlayers);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);
  
  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.email && player.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (player.parentName && player.parentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (player.parentEmail && player.parentEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openProgressDialog = (player: Player) => {
    setSelectedPlayer(player);
    setIsProgressDialogOpen(true);
  };

  const handlePlayerDeleted = () => {
    loadPlayers(); // Reload players from localStorage
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Players</h1>
            <p className="text-muted-foreground mt-1">Manage your player roster and profiles</p>
          </div>
          <Button className="bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
            <Link to="/players/new">
              <UserPlus className="h-4 w-4 mr-2" /> Add Player
            </Link>
          </Button>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2 mb-2">
          <Input 
            type="text" 
            placeholder="Search players..." 
            className="w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="icon" className="bg-tennis-green-600 hover:bg-tennis-green-700">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No players found. Add your first player to get started!</p>
            <Button className="mt-4 bg-tennis-green-600 hover:bg-tennis-green-700" asChild>
              <Link to="/players/new">
                <Plus className="h-4 w-4 mr-2" /> Add Player
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <PlayerCard 
                key={player.id} 
                {...player}
                onPlayerDeleted={handlePlayerDeleted}
                onProgressClick={openProgressDialog}
              />
            ))}
          </div>
        )}
        
        <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPlayer?.name}'s Progress</DialogTitle>
              <DialogDescription>
                View performance history and track development over time
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlayer && (
              <ProgressTracking 
                player={selectedPlayer} 
                session={{ id: "progress-view" }}
              />
            )}
            
            <DialogFooter>
              <Button variant="outline" asChild>
                <Link to={`/players/${selectedPlayer?.id}`} onClick={() => setIsProgressDialogOpen(false)}>
                  View Full Profile
                </Link>
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Players;
