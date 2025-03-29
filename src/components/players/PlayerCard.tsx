
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { User, Mail, Phone, MessageSquare, Calendar, BarChart3, FileText, ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PlayerCardProps {
  id: string;
  name: string; 
  skill: string;
  age: number;
  email: string;
  sessionsCount: number;
  phone?: string;
  extraActions?: React.ReactNode;
}

const PlayerCard = ({ 
  id, 
  name, 
  skill, 
  age, 
  email, 
  phone, 
  sessionsCount, 
  extraActions 
}: PlayerCardProps) => {
  const emailPlayer = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
  };

  const phonePlayer = (e: React.MouseEvent) => {
    e.preventDefault();
    if (phone) {
      window.location.href = `tel:${phone}`;
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
            </h3>
            <p className="text-sm text-muted-foreground">{skill} • {age} years old</p>
          </div>
          <div className={`flex items-center ${getProgressColor()}`}>
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{sessionsCount} sessions</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{email}</span>
          </div>
          {phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col space-y-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={emailPlayer}>
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
          {phone && (
            <Button variant="outline" size="sm" onClick={phonePlayer}>
              <Phone className="h-4 w-4 mr-1" />
              Call
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
