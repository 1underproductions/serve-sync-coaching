
import { useState, useEffect } from "react";
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
import { MoreHorizontal, Mail, Check, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Use client from integrations
import { WaitlistSignup } from "@/lib/supabase"; // Import the type
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WaitlistTable({ signups, onStatusChange }: { 
  signups: WaitlistSignup[]; 
  onStatusChange?: () => void;
}) {
  const { toast } = useToast();
  const [localSignups, setLocalSignups] = useState<WaitlistSignup[]>([]);
  const [detailView, setDetailView] = useState<WaitlistSignup | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    console.log("[WaitlistTable] Received signups:", signups);
    console.log("[WaitlistTable] Signups type:", typeof signups, Array.isArray(signups) ? "is array" : "not array");
    setLocalSignups(Array.isArray(signups) ? signups : []);
  }, [signups]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdateError(null);
      setDebugInfo(null);
      console.log("[WaitlistTable] Updating status for signup:", id, "to", newStatus);
      
      const { data, error } = await supabase
        .from('waitlist_signups')
        .update({ status: newStatus })
        .eq('id', id)
        .select();

      if (error) {
        console.error("[WaitlistTable] Error updating status:", error);
        setDebugInfo({ error, type: 'update_error' });
        setUpdateError(`Failed to update status: ${error.message}`);
        throw error;
      }

      console.log("[WaitlistTable] Status updated successfully, returned data:", data);
      setDebugInfo({ data, type: 'update_success' });

      setLocalSignups(prev => 
        prev.map(signup => 
          signup.id === id ? { ...signup, status: newStatus } : signup
        )
      );

      toast({
        title: "Status updated",
        description: `Signup status changed to ${newStatus}`,
      });
      
      if (openDialog) {
        setOpenDialog(false);
      }
      
      if (onStatusChange) {
        onStatusChange();
      }
      
    } catch (error: any) {
      console.error("[WaitlistTable] Full error:", error);
      toast({
        title: "Error updating status",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
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

  if (!localSignups || localSignups.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No waitlist signups found. Coaches will appear here when they sign up.
      </div>
    );
  }

  return (
    <>
      {updateError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{updateError}</AlertDescription>
        </Alert>
      )}
      
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
          
          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-40">
              <p className="font-bold mb-1">Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
