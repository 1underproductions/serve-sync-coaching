
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: 'paid' | 'pending' | 'none' | 'refunded' | 'failed' | string;
  showLabel?: boolean;
  className?: string;
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, showLabel = true, className = "" }) => {
  let icon = null;
  let badgeClass = "";
  let label = "";
  let tooltipText = "";

  switch (status) {
    case 'paid':
      icon = <CheckCircle className="h-3 w-3" />;
      badgeClass = "bg-green-100 text-green-800 hover:bg-green-200";
      label = "Paid";
      tooltipText = "Payment has been received";
      break;
    
    case 'pending':
      icon = <Clock className="h-3 w-3" />;
      badgeClass = "bg-orange-100 text-orange-800 hover:bg-orange-200";
      label = "Pending";
      tooltipText = "Payment link sent but not yet paid";
      break;
    
    case 'refunded':
      icon = <XCircle className="h-3 w-3" />;
      badgeClass = "bg-blue-100 text-blue-800 hover:bg-blue-200";
      label = "Refunded";
      tooltipText = "Payment has been refunded";
      break;
    
    case 'failed':
      icon = <AlertCircle className="h-3 w-3" />;
      badgeClass = "bg-red-100 text-red-800 hover:bg-red-200";
      label = "Failed";
      tooltipText = "Payment failed to process";
      break;
    
    case 'none':
    default:
      icon = null;
      badgeClass = "bg-gray-100 text-gray-800 hover:bg-gray-200";
      label = "No Payment";
      tooltipText = "No payment required or requested";
      break;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`flex items-center gap-1 ${badgeClass} ${className}`}>
            {icon}
            {showLabel && <span>{label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PaymentStatusBadge;
