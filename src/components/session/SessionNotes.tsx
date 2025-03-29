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
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ArrowRight, Save, Send } from "lucide-react";
import { Link } from "react-router-dom";

const notesSchema = z.object({
  preSessionNotes: z.string().optional(),
  postSessionNotes: z.string().optional(),
  playerFeedback: z.string().optional(),
});

const SessionNotes = ({ session }) => {
  const [savedNotes, setSavedNotes] = useState(null);
  const [player, setPlayer] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      preSessionNotes: "",
      postSessionNotes: "",
      playerFeedback: "",
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
          postSessionNotes: notes.postSessionNotes || "",
          playerFeedback: notes.playerFeedback || "",
        });
      }
      
      // Load player information if this is an individual session
      if (session.playerId) {
        const playersStr = localStorage.getItem("players");
        if (playersStr) {
          const players = JSON.parse(playersStr);
          const foundPlayer = players.find(p => p.id === session.playerId);
          if (foundPlayer) {
            setPlayer(foundPlayer);
          }
        }
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }, [session.id, session.playerId, form]);

  const onSubmit = (data) => {
    try {
      const now = new Date();
      
      // Save notes to localStorage
      const notesData = {
        ...data,
        sessionId: session.id,
        playerId: session.playerId,
        updatedAt: now.toISOString(),
      };
      
      localStorage.setItem(`session_notes_${session.id}`, JSON.stringify(notesData));
      setSavedNotes(notesData);
      
      // Also save to player notes if there's a player associated
      if (session.playerId && player) {
        // Add pre-session notes to player notes
        if (data.preSessionNotes) {
          saveToPlayerNotes({
            title: `Pre-session: ${session.title}`,
            content: data.preSessionNotes,
            category: "Pre-session Notes",
          });
        }
        
        // Add post-session notes to player notes
        if (data.postSessionNotes) {
          saveToPlayerNotes({
            title: `Post-session: ${session.title}`,
            content: data.postSessionNotes,
            category: "Post-session Notes",
          });
        }
        
        // Add to player progress history
        const progressKey = `player_progress_${session.playerId}`;
        const existingProgressStr = localStorage.getItem(progressKey);
        const existingProgress = existingProgressStr ? JSON.parse(existingProgressStr) : [];
        
        // Check if we already have a note in the progress
        const existingNoteIndex = existingProgress.findIndex(p => 
          p.type === "notes" && p.sessionId === session.id
        );
        
        if (existingNoteIndex >= 0) {
          // Update existing note
          existingProgress[existingNoteIndex].data = notesData;
          existingProgress[existingNoteIndex].updatedAt = now.toISOString();
        } else {
          // Add new note
          existingProgress.push({
            id: crypto.randomUUID(),
            type: "notes",
            sessionId: session.id,
            sessionTitle: session.title,
            date: session.date,
            data: notesData,
            createdAt: now.toISOString(),
          });
        }
        
        localStorage.setItem(progressKey, JSON.stringify(existingProgress));
      }
      
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

  const saveToPlayerNotes = (noteData) => {
    try {
      const notesKey = `player_notes_${session.playerId}`;
      const existingNotesStr = localStorage.getItem(notesKey);
      const existingNotes = existingNotesStr ? JSON.parse(existingNotesStr) : [];
      
      // Create the new note
      const newNote = {
        id: crypto.randomUUID(),
        ...noteData,
        playerId: session.playerId,
        sessionId: session.id,
        createdAt: new Date().toISOString(),
      };
      
      // Add it to the notes array
      const updatedNotes = [newNote, ...existingNotes.filter(note => 
        !(note.sessionId === session.id && note.category === noteData.category)
      )];
      
      // Save back to localStorage
      localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Error saving to player notes:", error);
    }
  };

  const sendFeedbackToPlayer = () => {
    if (!player?.email) {
      toast({
        title: "Error",
        description: "Player email not available",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Feedback sent",
      description: `Session feedback has been sent to ${player.email}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
          <CardDescription>
            Record your notes before and after this session
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
                    <FormLabel>Pre-Session Notes</FormLabel>
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
              
              <FormField
                control={form.control}
                name="postSessionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post-Session Notes</FormLabel>
                    <FormDescription>
                      How did the session go? What was accomplished? What needs more work?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Made good progress on serve technique, backhand still needs work..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {player && (
                <FormField
                  control={form.control}
                  name="playerFeedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback for Player</FormLabel>
                      <FormDescription>
                        Write feedback that will be shared with {player.name}. This can include accomplishments, areas to work on, and home practice suggestions.
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Great job on your forehand today! Please practice the following drills at home..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex space-x-3">
                <Button type="submit" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
                
                {player && savedNotes?.playerFeedback && (
                  <Button type="button" variant="outline" onClick={sendFeedbackToPlayer}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback to Player
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {savedNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Notes</CardTitle>
            <CardDescription>
              Last updated: {format(new Date(savedNotes.updatedAt), "PPP p")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedNotes.preSessionNotes && (
              <div>
                <h3 className="font-medium">Pre-Session Notes</h3>
                <p className="whitespace-pre-wrap mt-2 p-3 bg-muted rounded-md text-sm">
                  {savedNotes.preSessionNotes}
                </p>
              </div>
            )}
            
            {savedNotes.postSessionNotes && (
              <div>
                <h3 className="font-medium">Post-Session Notes</h3>
                <p className="whitespace-pre-wrap mt-2 p-3 bg-muted rounded-md text-sm">
                  {savedNotes.postSessionNotes}
                </p>
              </div>
            )}
            
            {player && savedNotes.playerFeedback && (
              <div>
                <h3 className="font-medium">Feedback for Player</h3>
                <p className="whitespace-pre-wrap mt-2 p-3 bg-muted rounded-md text-sm">
                  {savedNotes.playerFeedback}
                </p>
              </div>
            )}
          </CardContent>
          {player && savedNotes.playerFeedback && (
            <CardFooter>
              <Button variant="outline" size="sm" onClick={sendFeedbackToPlayer}>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback to {player.name}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {player && (
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>All notes are automatically linked to {player.name}'s profile</span>
          </div>
          <Button variant="link" size="sm" asChild>
            <Link to={`/players/${player.id}`}>
              View Player Profile
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SessionNotes;
