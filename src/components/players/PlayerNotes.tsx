
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Save, Plus, X } from "lucide-react";

const noteSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  content: z.string().min(1, {
    message: "Note content is required",
  }),
  category: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

const PlayerNotes = ({ player }) => {
  const [notes, setNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "General",
    },
  });

  useEffect(() => {
    // Load existing notes
    try {
      const notesKey = `player_notes_${player.id}`;
      const notesStr = localStorage.getItem(notesKey);
      if (notesStr) {
        const loadedNotes = JSON.parse(notesStr);
        setNotes(loadedNotes);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }, [player.id]);

  const onSubmit = (data: NoteFormValues) => {
    try {
      // Create new note with metadata
      const newNote = {
        id: crypto.randomUUID(),
        ...data,
        playerId: player.id,
        createdAt: new Date().toISOString(),
      };
      
      // Update notes array
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      
      // Save to localStorage
      const notesKey = `player_notes_${player.id}`;
      localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
      
      // Reset form and toggle add mode
      form.reset();
      setIsAddingNote(false);
      
      toast({
        title: "Note added",
        description: "Your note has been saved",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = (noteId) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      // Save to localStorage
      const notesKey = `player_notes_${player.id}`;
      localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
      
      toast({
        title: "Note deleted",
        description: "The note has been removed",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Player Notes</h3>
        <Button 
          onClick={() => setIsAddingNote(!isAddingNote)} 
          variant="outline"
          size="sm"
        >
          {isAddingNote ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </>
          )}
        </Button>
      </div>

      {isAddingNote && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Note title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technique, Mental, Physical" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter your note here..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-md">
          <p className="text-muted-foreground">No notes yet. Add your first note to track player observations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {note.category && (
                        <span className="px-2 py-0.5 bg-muted text-xs rounded-full">
                          {note.category}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(note.createdAt), "PPP")}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteNote(note.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerNotes;
