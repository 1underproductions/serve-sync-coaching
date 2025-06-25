
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: string;
  showLabel?: boolean;
  className?: string;
}

const PaymentStatusBadge = ({ status, showLabel = false, className = "" }: PaymentStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Paid'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Pending'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          label: 'Failed'
        };
      case 'refunded':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: RotateCcw,
          label: 'Refunded'
        };
      case 'active':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          label: 'Active'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} ${className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
};

export default PaymentStatusBadge;
