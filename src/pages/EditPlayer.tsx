
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const editPlayerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  isChild: z.boolean().default(false),
  email: z.string().email({ message: "Please enter a valid email address" }).optional()
    .or(z.string().length(0))
    .transform(e => e === "" ? undefined : e),
  parentName: z.string().optional(),
  parentEmail: z.string().email({ message: "Please enter a valid parent email address" }).optional(),
  parentPhone: z.string().optional(),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Please enter a valid age",
  }),
  skill: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a skill level",
  }),
  notes: z.string().optional(),
  phone: z.string().optional()
    .or(z.string().length(0))
    .transform(e => e === "" ? undefined : e),
}).refine(data => {
  if (data.isChild && !data.parentEmail) {
    return false;
  }
  if (data.isChild && !data.parentPhone) {
    return false;
  }
  if (!data.isChild && !data.email) {
    return false;
  }
  return true;
}, {
  message: "Email is required. For children, parent email and phone are required.",
  path: ["email"]
});

type EditPlayerFormValues = z.infer<typeof editPlayerFormSchema>;

const EditPlayer = () => {
  const { playerId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [player, setPlayer] = useState(null);
  
  const form = useForm<EditPlayerFormValues>({
    resolver: zodResolver(editPlayerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      age: "",
      skill: "Beginner",
      notes: "",
      phone: "",
      isChild: false,
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    },
  });

  const isChild = form.watch("isChild");

  useEffect(() => {
    const fetchPlayer = () => {
      try {
        const playersStr = localStorage.getItem("players");
        if (!playersStr) {
          toast({
            title: "Error",
            description: "No players found",
            variant: "destructive"
          });
          navigate("/players");
          return;
        }

        const players = JSON.parse(playersStr);
        const foundPlayer = players.find(p => p.id === playerId);
        
        if (!foundPlayer) {
          toast({
            title: "Player not found",
            description: "The requested player could not be found",
            variant: "destructive"
          });
          navigate("/players");
          return;
        }
        
        setPlayer(foundPlayer);
        
        // Populate form with player data
        form.reset({
          name: foundPlayer.name || "",
          email: foundPlayer.email || "",
          age: foundPlayer.age?.toString() || "",
          skill: foundPlayer.skill || "Beginner",
          notes: foundPlayer.notes || "",
          phone: foundPlayer.phone || "",
          isChild: foundPlayer.isChild || false,
          parentName: foundPlayer.parentName || "",
          parentEmail: foundPlayer.parentEmail || "",
          parentPhone: foundPlayer.parentPhone || "",
        });
      } catch (error) {
        console.error("Error fetching player:", error);
        toast({
          title: "Error",
          description: "Failed to load player details",
          variant: "destructive"
        });
        navigate("/players");
      }
    };

    if (playerId) {
      fetchPlayer();
    }
  }, [playerId, navigate, toast, form]);

  const onSubmit = async (data: EditPlayerFormValues) => {
    setIsSubmitting(true);
    
    try {
      const existingPlayers = JSON.parse(localStorage.getItem("players") || "[]");
      const updatedPlayers = existingPlayers.map(p => 
        p.id === playerId 
          ? { ...p, ...data, age: parseInt(data.age) }
          : p
      );
      
      localStorage.setItem("players", JSON.stringify(updatedPlayers));
      
      toast({
        title: "Player Updated",
        description: `${data.name}'s profile has been updated successfully.`,
      });
      
      navigate(`/players/${playerId}`);
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        title: "Error",
        description: "Failed to update player. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlayer = async () => {
    setIsDeleting(true);
    
    try {
      const existingPlayers = JSON.parse(localStorage.getItem("players") || "[]");
      const updatedPlayers = existingPlayers.filter(p => p.id !== playerId);
      
      localStorage.setItem("players", JSON.stringify(updatedPlayers));
      
      toast({
        title: "Player Deleted",
        description: `${player?.name} has been removed from your players list.`,
      });
      
      navigate("/players");
    } catch (error) {
      console.error("Error deleting player:", error);
      toast({
        title: "Error",
        description: "Failed to delete player. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!player) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading player details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(`/players/${playerId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Edit Player Profile</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isChild"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>This is a child player</FormLabel>
                    <FormDescription>
                      If checked, you'll need to provide parent/guardian contact information
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isChild && (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {isChild && (
              <div className="space-y-6 rounded-md border p-4">
                <h3 className="font-medium">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent/Guardian Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Parent's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="parent@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Phone <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about playing style, goals, etc."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="destructive"
                    disabled={isSubmitting || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Player
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete {player?.name}'s profile and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePlayer} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Player"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/players/${playerId}`)}
                  disabled={isSubmitting || isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-tennis-green-600 hover:bg-tennis-green-700"
                  disabled={isSubmitting || isDeleting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default EditPlayer;
