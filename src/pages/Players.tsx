
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Plus, Search, UserPlus } from "lucide-react";
import PlayerCard from "@/components/players/PlayerCard";

// Define the Player type
interface Player {
  id: string;
  name: string;
  skill: string;
  age: number;
  email: string;
  sessionsCount: number;
  phone?: string;
  notes?: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
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
      ];
      localStorage.setItem("players", JSON.stringify(mockPlayers));
      setPlayers(mockPlayers);
    }
  }, []);
  
  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Button type="submit" size="icon">
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
              <PlayerCard key={player.id} {...player} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Players;
