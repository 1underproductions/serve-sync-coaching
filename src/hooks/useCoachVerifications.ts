
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useCoachVerifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: verifications, isLoading, error } = useQuery({
    queryKey: ["coach-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_verifications")
        .select(
          `
            *,
            coach:profiles(
              id, full_name, email, avatar_url
            ),
            verified_by_profile:profiles(
              id, full_name
            )
          `
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateVerification = useMutation({
    mutationFn: async ({
      id,
      is_verified,
      notes,
    }: {
      id: string;
      is_verified: boolean;
      notes?: string;
    }) => {
      const updates: any = { is_verified };
      if (notes !== undefined) updates.notes = notes;

      const { error } = await supabase
        .from("coach_verifications")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-verifications"] });
      toast({
        title: "Success",
        description: "Verification status updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update verification.",
      });
    },
  });

  return { verifications, isLoading, error, updateVerification };
}
