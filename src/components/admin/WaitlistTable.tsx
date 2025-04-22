
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
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Experience</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {localSignups.map((signup) => (
          <TableRow key={signup.id}>
            <TableCell>{signup.full_name}</TableCell>
            <TableCell>{signup.email}</TableCell>
            <TableCell>{signup.years_experience} years</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${signup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  signup.status === 'contacted' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'}`
              }>
                {signup.status}
              </span>
            </TableCell>
            <TableCell>{format(new Date(signup.created_at), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = `mailto:${signup.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus(signup.id, 'contacted')}>
                    Mark as Contacted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateStatus(signup.id, 'rejected')}>
                    Mark as Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
