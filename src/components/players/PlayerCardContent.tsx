
import { User, Mail, Phone } from "lucide-react";

interface PlayerCardContentProps {
  email?: string;
  phone?: string;
  isChild?: boolean;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
}

const PlayerCardContent = ({
  email,
  phone,
  isChild,
  parentName,
  parentEmail,
  parentPhone
}: PlayerCardContentProps) => {
  return (
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
  );
};

export default PlayerCardContent;
