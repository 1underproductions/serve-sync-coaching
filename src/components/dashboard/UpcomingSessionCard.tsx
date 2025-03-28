
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionProps {
  id: string;
  title: string;
  playerName: string;
  date: string;
  time: string;
  type: 'individual' | 'group';
}

const UpcomingSessionCard = ({ id, title, playerName, date, time, type }: SessionProps) => {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <User className="h-3.5 w-3.5 mr-1" />
              {playerName}
            </CardDescription>
          </div>
          <div className="bg-tennis-green-100 text-tennis-green-800 rounded-full px-2 py-1 text-xs font-medium">
            {type === 'individual' ? 'Individual' : 'Group'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{time}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/session/${id}`}>View Details</Link>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link to={`/session/${id}/edit`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingSessionCard;
