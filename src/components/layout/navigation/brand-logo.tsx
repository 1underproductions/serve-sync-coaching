
import { Link } from "react-router-dom";

interface BrandLogoProps {
  isAdmin: boolean;
}

export const BrandLogo = ({ isAdmin }: BrandLogoProps) => {
  return (
    <div className="p-4 border-b">
      <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center space-x-2">
        <span className="text-xl font-bold text-tennis-green-600">Tennexis</span>
      </Link>
    </div>
  );
};
