
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import PlayerCard from "@/components/players/PlayerCard";

// Mock data for demonstration
const players = [
  { id: "1", name: "Michael Johnson", skill: "Intermediate", age: 28, email: "michael@example.com", sessionsCount: 12 },
  { id: "2", name: "Sarah Williams", skill: "Advanced", age: 24, email: "sarah@example.com", sessionsCount: 24 },
  { id: "3", name: "David Smith", skill: "Beginner", age: 32, email: "david@example.com", sessionsCount: 5 },
  { id: "4", name: "Emma Wilson", skill: "Intermediate", age: 22, email: "emma@example.com", sessionsCount: 8 },
  { id: "5", name: "Robert Brown", skill: "Advanced", age: 34, email: "robert@example.com", sessionsCount: 15 },
  { id: "6", name: "Laura Garcia", skill: "Beginner", age: 26, email: "laura@example.com", sessionsCount: 3 },
  { id: "7", name: "Jason Taylor", skill: "Intermediate", age: 30, email: "jason@example.com", sessionsCount: 10 },
  { id: "8", name: "Amy Martinez", skill: "Advanced", age: 27, email: "amy@example.com", sessionsCount: 18 },
];

const Players = () => {
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
              <Plus className="h-4 w-4 mr-2" /> Add Player
            </Link>
          </Button>
        </div>

        <div className="flex w-full max-w-sm items-center space-x-2 mb-2">
          <Input type="text" placeholder="Search players..." className="w-full" />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <PlayerCard key={player.id} {...player} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Players;
