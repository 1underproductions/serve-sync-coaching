
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PlayerCardHeader from "./PlayerCardHeader";
import PlayerCardContent from "./PlayerCardContent";
import PlayerCardFooter from "./PlayerCardFooter";

interface PlayerCardProps {
  id: string;
  name: string; 
  skill: string;
  age: number;
  email?: string;
  sessionsCount: number;
  phone?: string;
  isChild?: boolean;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  extraActions?: React.ReactNode;
  onPlayerDeleted?: () => void;
  onProgressClick?: (player: any) => void;
}

const PlayerCard = ({ 
  id, 
  name, 
  skill, 
  age, 
  email, 
  phone, 
  sessionsCount,
  isChild,
  parentName,
  parentEmail,
  parentPhone,
  extraActions,
  onPlayerDeleted,
  onProgressClick
}: PlayerCardProps) => {
  const { toast } = useToast();

  const emailPlayer = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactEmail = isChild ? parentEmail : email;
    if (contactEmail) {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  const phonePlayer = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactPhone = isChild ? parentPhone : phone;
    if (contactPhone) {
      window.location.href = `tel:${contactPhone}`;
    }
  };

  const handleDeletePlayer = async () => {
    try {
      const existingPlayers = JSON.parse(localStorage.getItem("players") || "[]");
      const updatedPlayers = existingPlayers.filter(p => p.id !== id);
      
      localStorage.setItem("players", JSON.stringify(updatedPlayers));
      
      toast({
        title: "Player Deleted",
        description: `${name} has been removed from your players list.`,
      });
      
      if (onPlayerDeleted) {
        onPlayerDeleted();
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      toast({
        title: "Error",
        description: "Failed to delete player. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProgressClick = () => {
    if (onProgressClick) {
      const playerData = {
        id,
        name,
        skill,
        age,
        email,
        phone,
        sessionsCount,
        isChild,
        parentName,
        parentEmail,
        parentPhone
      };
      onProgressClick(playerData);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <PlayerCardHeader
          id={id}
          name={name}
          skill={skill}
          age={age}
          sessionsCount={sessionsCount}
          isChild={isChild}
          onDeletePlayer={handleDeletePlayer}
        />
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <PlayerCardContent
          email={email}
          phone={phone}
          isChild={isChild}
          parentName={parentName}
          parentEmail={parentEmail}
          parentPhone={parentPhone}
        />
      </CardContent>
      <CardFooter className="pt-2 flex flex-col space-y-2">
        <PlayerCardFooter
          id={id}
          email={email}
          phone={phone}
          isChild={isChild}
          parentEmail={parentEmail}
          parentPhone={parentPhone}
          onEmailPlayer={emailPlayer}
          onPhonePlayer={phonePlayer}
          onProgressClick={handleProgressClick}
        />
      </CardFooter>
    </Card>
  );
};

export default PlayerCard;
