
import { Button } from "@/components/ui/button";
import { Mail, Phone, FileText, ChartLine } from "lucide-react";
import { Link } from "react-router-dom";

interface PlayerCardFooterProps {
  id: string;
  email?: string;
  phone?: string;
  isChild?: boolean;
  parentEmail?: string;
  parentPhone?: string;
  onEmailPlayer: (e: React.MouseEvent) => void;
  onPhonePlayer: (e: React.MouseEvent) => void;
  onProgressClick: () => void;
}

const PlayerCardFooter = ({
  id,
  email,
  phone,
  isChild,
  parentEmail,
  parentPhone,
  onEmailPlayer,
  onPhonePlayer,
  onProgressClick
}: PlayerCardFooterProps) => {
  const contactPhone = isChild ? parentPhone : phone;
  const contactEmail = isChild ? parentEmail : email;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between w-full">
        <Button variant="outline" size="sm" onClick={onEmailPlayer} disabled={!contactEmail}>
          <Mail className="h-4 w-4 mr-1" />
          Email {isChild ? "Parent" : ""}
        </Button>
        {contactPhone && (
          <Button variant="outline" size="sm" onClick={onPhonePlayer}>
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
        <Button variant="ghost" size="sm" onClick={onProgressClick}>
          <ChartLine className="h-4 w-4 mr-1" />
          Progress
        </Button>
      </div>
    </div>
  );
};

export default PlayerCardFooter;
