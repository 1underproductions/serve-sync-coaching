
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface PlayerProps {
  id: string;
  name: string;
  skill: string;
  age: number;
  email: string;
  sessionsCount: number;
}

const PlayerCard = ({ id, name, skill, age, email, sessionsCount }: PlayerProps) => {
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-tennis-blue-100 text-tennis-blue-800">
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Age:</span> {age}
          </div>
          <div>
            <span className="text-muted-foreground">Skill:</span> {skill}
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Sessions:</span> {sessionsCount} total
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/player/${id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlayerCard;
