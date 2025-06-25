
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
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

interface PlayerCardHeaderProps {
  id: string;
  name: string;
  skill: string;
  age: number;
  sessionsCount: number;
  isChild?: boolean;
  onDeletePlayer: () => void;
}

const PlayerCardHeader = ({
  id,
  name,
  skill,
  age,
  sessionsCount,
  isChild,
  onDeletePlayer
}: PlayerCardHeaderProps) => {
  const getProgressColor = () => {
    if (sessionsCount > 20) return "text-tennis-green-500";
    if (sessionsCount > 10) return "text-blue-500";
    return "text-orange-500";
  };

  return (
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
              <AlertDialogAction onClick={onDeletePlayer} className="bg-red-600 hover:bg-red-700">
                Delete Player
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PlayerCardHeader;
