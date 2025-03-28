
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard } from "lucide-react";

type TrialExpirationBannerProps = {
  daysRemaining: number;
  onDismiss?: () => void;
};

const TrialExpirationBanner = ({
  daysRemaining,
  onDismiss,
}: TrialExpirationBannerProps) => {
  // Create message based on days remaining
  const getMessage = () => {
    if (daysRemaining <= 0) {
      return "Your free trial has expired. Please add your payment details to continue using ServeSync.";
    } else if (daysRemaining === 1) {
      return "Your free trial expires tomorrow. Add your payment details now to ensure uninterrupted access.";
    } else {
      return `Your free trial expires in ${daysRemaining} days. Add your payment details to continue after your trial.`;
    }
  };

  return (
    <div className="bg-tennis-green-50 border border-tennis-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start md:items-center flex-col md:flex-row gap-4 md:gap-0 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-tennis-green-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-tennis-green-700" />
          </div>
          <p className="text-tennis-green-800">{getMessage()}</p>
        </div>
        <div className="flex items-center gap-2 ml-0 md:ml-4">
          <Button 
            variant="tennis" 
            size="sm" 
            className="whitespace-nowrap"
            asChild
          >
            <Link to="/billing">
              <CreditCard className="h-4 w-4 mr-1" />
              Add Payment
            </Link>
          </Button>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-tennis-green-700"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrialExpirationBanner;
