
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { User, Mail, Phone, MessageSquare, Calendar, BarChart3, FileText, ChartLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";

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
  onPlayerDeleted
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
      
      // Call the callback to refresh the parent component
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

  const getProgressColor = () => {
    if (sessionsCount > 20) return "text-tennis-green-500";
    if (sessionsCount > 10) return "text-blue-500";
    return "text-orange-500";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              <Link to={`/players/${id}`} className="hover:underline">
                {name}
              </Link>
              {isChild && (
                <Badge variant="sessions" className="ml-2">
                  Child
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{skill} • {age} years old</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center ${getProgressColor()}`}>
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{sessionsCount} sessions</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Player</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {name}? This action cannot be undone and will permanently remove all player data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePlayer} className="bg-red-600 hover:bg-red-700">
                    Delete Player
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2">
          {isChild ? (
            <>
              {parentName && (
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{parentName} (Parent)</span>
                </div>
              )}
              {parentEmail && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{parentEmail}</span>
                </div>
              )}
              {parentPhone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{parentPhone}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{phone}</span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col space-y-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={emailPlayer} disabled={isChild ? !parentEmail : !email}>
            <Mail className="h-4 w-4 mr-1" />
            Email {isChild ? "Parent" : ""}
          </Button>
          {(isChild ? parentPhone : phone) && (
            <Button variant="outline" size="sm" onClick={phonePlayer}>
              <Phone className="h-4 w-4 mr-1" />
              Call {isChild ? "Parent" : ""}
            </Button>
          )}
        </div>
        
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/players/${id}`}>
              <FileText className="h-4 w-4 mr-1" />
              View Profile
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            <ChartLine className="h-4 w-4 mr-1" />
            Progress
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlayerCard;
