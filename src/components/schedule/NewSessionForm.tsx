import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Clock, Check, ChevronsUpDown, UserPlus, Save } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
  skill: string;
  age: number;
  email: string;
  sessionsCount: number;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  playerId: z.string({ required_error: "Please select a player" }),
  date: z.date({ required_error: "A date is required" }),
  startTime: z.string({ required_error: "Start time is required" }),
  endTime: z.string({ required_error: "End time is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  type: z.enum(["individual", "group", "tournament"], { required_error: "Session type is required" }),
  isRecurring: z.boolean().default(false),
});

interface NewSessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewSessionForm = ({ open, onOpenChange }: NewSessionFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      playerId: "",
      location: "",
      type: "individual",
      startTime: "09:00",
      endTime: "10:00",
      isRecurring: false,
    },
  });
  
  useEffect(() => {
    const initializeData = () => {
      try {
        const storedPlayers = localStorage.getItem("players");
        console.log("Stored players:", storedPlayers);
        
        let parsedPlayers: Player[] = [];
        if (storedPlayers) {
          try {
            parsedPlayers = JSON.parse(storedPlayers);
            console.log("Parsed players:", parsedPlayers);
          } catch (parseError) {
            console.error("Error parsing players:", parseError);
          }
        }
        
        if (Array.isArray(parsedPlayers) && parsedPlayers.length > 0) {
          console.log("Setting players from localStorage:", parsedPlayers);
          setPlayers(parsedPlayers);
        } else {
          const mockPlayers = [
            { id: "1", name: "Michael Johnson", skill: "Intermediate", age: 28, email: "michael@example.com", sessionsCount: 12 },
            { id: "2", name: "Sarah Williams", skill: "Advanced", age: 24, email: "sarah@example.com", sessionsCount: 24 },
            { id: "3", name: "David Smith", skill: "Beginner", age: 32, email: "david@example.com", sessionsCount: 5 },
          ];
          console.log("Setting mock players:", mockPlayers);
          localStorage.setItem("players", JSON.stringify(mockPlayers));
          setPlayers(mockPlayers);
        }
      } catch (error) {
        console.error("Error initializing player data:", error);
        setPlayers([]);
      } finally {
        setIsLoaded(true);
      }
    };
    
    initializeData();
  }, []);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const selectedPlayer = players.find(player => player.id === data.playerId);
    const playerName = selectedPlayer ? selectedPlayer.name : "Unknown player";
    
    const newSession = {
      id: crypto.randomUUID(),
      ...data,
      playerName,
      createdAt: new Date().toISOString(),
    };
    
    const existingSessions = JSON.parse(localStorage.getItem("sessions") || "[]");
    localStorage.setItem("sessions", JSON.stringify([...existingSessions, newSession]));
    
    if (selectedPlayer) {
      const updatedPlayers = players.map(player => {
        if (player.id === selectedPlayer.id) {
          return {
            ...player,
            sessionsCount: player.sessionsCount + 1
          };
        }
        return player;
      });
      
      localStorage.setItem("players", JSON.stringify(updatedPlayers));
    }
    
    toast({
      title: "Session Created",
      description: `Session with ${playerName} has been scheduled.`,
    });
    
    onOpenChange(false);
    navigate("/schedule");
  };

  if (!isLoaded) {
    return null;
  }

  const hasPlayers = Array.isArray(players) && players.length > 0;
  console.log("Players available:", players);
  console.log("Has players:", hasPlayers);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Add a new coaching session to your schedule.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Forehand Technique" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="playerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Player</FormLabel>
                  {!hasPlayers ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">No players available. Add a player first.</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full justify-center"
                        asChild
                      >
                        <Link to="/players/new">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add New Player
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name} ({player.skill})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Court 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Session</FormLabel>
                    <FormDescription>
                      This will create a weekly recurring session at this time.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-tennis-green-600 hover:bg-tennis-green-700"
                disabled={!hasPlayers}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Session
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSessionForm;
