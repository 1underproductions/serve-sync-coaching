
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const notesSchema = z.object({
  preSessionNotes: z.string().optional(),
});

const SessionNotes = ({ session }) => {
  const [savedNotes, setSavedNotes] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      preSessionNotes: "",
    },
  });

  useEffect(() => {
    // Load existing notes
    try {
      const notesStr = localStorage.getItem(`session_notes_${session.id}`);
      if (notesStr) {
        const notes = JSON.parse(notesStr);
        setSavedNotes(notes);
        form.reset({
          preSessionNotes: notes.preSessionNotes || "",
        });
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }, [session.id, form]);

  const onSubmit = (data) => {
    try {
      // Save notes to localStorage
      localStorage.setItem(`session_notes_${session.id}`, JSON.stringify(data));
      setSavedNotes(data);
      toast({
        title: "Notes saved",
        description: "Your session notes have been saved",
      });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Session Notes</CardTitle>
          <CardDescription>
            Add key focus areas and preparation notes before the session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="preSessionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focus Areas</FormLabel>
                    <FormDescription>
                      What will you focus on in this session? Add notes about drills, techniques or specific skills.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Work on forehand technique, focus on proper follow-through..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                Save Notes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {savedNotes && savedNotes.preSessionNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Notes</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap p-4 bg-muted rounded-md">
              {savedNotes.preSessionNotes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionNotes;
