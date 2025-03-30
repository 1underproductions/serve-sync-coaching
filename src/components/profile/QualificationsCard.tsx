
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const QUALIFICATIONS_KEY = 'tennexis.qualifications';
const COACHING_LEVEL_KEY = 'tennexis.coachingLevel';

export const QualificationsCard = () => {
  const navigate = useNavigate();
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [coachingLevel, setCoachingLevel] = useState<string>("");

  useEffect(() => {
    const savedQualifications = localStorage.getItem(QUALIFICATIONS_KEY);
    if (savedQualifications) {
      try {
        setQualifications(JSON.parse(savedQualifications));
      } catch (error) {
        console.error('Error parsing qualifications from localStorage:', error);
        setQualifications([]);
      }
    } else {
      setQualifications([]);
    }

    const savedCoachingLevel = localStorage.getItem(COACHING_LEVEL_KEY);
    if (savedCoachingLevel) {
      setCoachingLevel(savedCoachingLevel);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-tennis-green-600" />
          Coaching Qualifications
        </CardTitle>
        <CardDescription>
          Add your coaching levels and certifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {coachingLevel ? (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Primary Coaching Level</h3>
            <Badge variant="custom" className="bg-tennis-green-700 text-white hover:bg-tennis-green-800">
              {coachingLevel}
            </Badge>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700">
              Set your primary coaching level in the Settings page
            </p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium mb-2">Certifications & Qualifications</h3>
          
          {qualifications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {qualifications.map((qual, index) => (
                <Badge 
                  key={index} 
                  variant="custom" 
                  className="bg-tennis-green-100 text-tennis-green-800"
                >
                  {qual}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                You haven't added any qualifications yet. Add them in the Settings page.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="text-tennis-green-700 border-tennis-green-200 hover:bg-tennis-green-50"
          >
            Manage Qualifications in Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
