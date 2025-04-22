
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistSignup } from "@/lib/supabase";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

function convertSignupsToCsv(signups: WaitlistSignup[]) {
  // Only export the main fields users care about
  const headers = [
    "Full Name",
    "Email",
    "Years Experience",
    "Message",
    "Joined",
  ];
  const rows = signups.map((signup) => [
    `"${signup.full_name.replace(/"/g, '""')}"`,
    `"${signup.email.replace(/"/g, '""')}"`,
    signup.years_experience ?? "",
    `"${(signup.message ?? "").replace(/"/g, '""')}"`,
    format(new Date(signup.created_at), 'yyyy-MM-dd HH:mm'),
  ]);
  return [headers, ...rows].map((row) => row.join(",")).join("\r\n");
}

export default function WaitlistTable({ signups }: { signups: WaitlistSignup[] }) {
  const { toast } = useToast();
  const [localSignups, setLocalSignups] = useState<WaitlistSignup[]>([]);
  const [detailView, setDetailView] = useState<WaitlistSignup | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    setLocalSignups(Array.isArray(signups) ? signups : []);
  }, [signups]);

  const viewDetails = (signup: WaitlistSignup) => {
    setDetailView(signup);
    setOpenDialog(true);
  };

  const sendEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Tennexis Coaching Platform - Application`;
  };

  const handleExportCsv = () => {
    try {
      const csv = convertSignupsToCsv(localSignups);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "waitlist.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Exported",
        description: `Exported ${localSignups.length} signups as CSV.`,
      });
    } catch (err: any) {
      toast({
        title: "Error exporting CSV",
        description: err?.message || "Could not export data",
        variant: "destructive",
      });
    }
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
      <div className="flex justify-end pb-3">
        <Button size="sm" variant="outline" className="gap-2" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localSignups.map((signup) => (
            <TableRow key={signup.id}>
              <TableCell className="font-medium">{signup.full_name}</TableCell>
              <TableCell>{signup.email}</TableCell>
              <TableCell>{signup.years_experience} years</TableCell>
              <TableCell>{format(new Date(signup.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell className="truncate max-w-xs">
                {signup.message?.substring(0, 64) || "–"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => viewDetails(signup)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => sendEmail(signup.email)}>
                    <Mail className="h-4 w-4" />
                  </Button>
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
                <div className="col-span-1 text-sm font-medium">Joined:</div>
                <div className="col-span-3">{format(new Date(detailView.created_at), 'PPP')}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Message:</div>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {detailView.message || "No message provided"}
                </div>
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
