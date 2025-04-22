
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Mail, Check, X, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WaitlistSignup = {
  id: string;
  email: string;
  full_name: string;
  years_experience: number;
  message: string | null;
  status: 'pending' | 'contacted' | 'rejected';
  created_at: string;
};

export default function WaitlistTable({ signups }: { signups: WaitlistSignup[] }) {
  const { toast } = useToast();
  const [localSignups, setLocalSignups] = useState(signups);
  const [detailView, setDetailView] = useState<WaitlistSignup | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const updateStatus = async (id: string, newStatus: WaitlistSignup['status']) => {
    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setLocalSignups(prev => 
        prev.map(signup => 
          signup.id === id ? { ...signup, status: newStatus } : signup
        )
      );

      toast({
        title: "Status updated",
        description: `Signup status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: WaitlistSignup['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Contacted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const viewDetails = (signup: WaitlistSignup) => {
    setDetailView(signup);
    setOpenDialog(true);
  };

  const sendEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Tennexis Coaching Platform - Application Update`;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localSignups.map((signup) => (
            <TableRow key={signup.id}>
              <TableCell className="font-medium">{signup.full_name}</TableCell>
              <TableCell>{signup.email}</TableCell>
              <TableCell>{signup.years_experience} years</TableCell>
              <TableCell>
                {getStatusBadge(signup.status)}
              </TableCell>
              <TableCell>{format(new Date(signup.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => viewDetails(signup)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => sendEmail(signup.email)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(signup.id, 'contacted')}>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        Mark as Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(signup.id, 'rejected')}>
                        <X className="mr-2 h-4 w-4 text-red-600" />
                        Reject Application
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Coach Application Details</DialogTitle>
            <DialogDescription>
              Review the complete application information.
            </DialogDescription>
          </DialogHeader>
          
          {detailView && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 text-sm font-medium">Name:</div>
                <div className="col-span-3">{detailView.full_name}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 text-sm font-medium">Email:</div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    {detailView.email}
                    <Button size="sm" variant="ghost" onClick={() => sendEmail(detailView.email)}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 text-sm font-medium">Experience:</div>
                <div className="col-span-3">{detailView.years_experience} years</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 text-sm font-medium">Status:</div>
                <div className="col-span-3">{getStatusBadge(detailView.status)}</div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 text-sm font-medium">Joined:</div>
                <div className="col-span-3">{format(new Date(detailView.created_at), 'PPP')}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Message:</div>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {detailView.message || "No message provided"}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => updateStatus(detailView.id, 'rejected')}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => updateStatus(detailView.id, 'contacted')}>
                  <Check className="mr-2 h-4 w-4" />
                  Approve & Contact
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
