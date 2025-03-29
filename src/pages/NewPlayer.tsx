
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const playerFormSchema = z.object({
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
  // If it's a child, parent email is required
  if (data.isChild && !data.parentEmail) {
    return false;
  }
  // If it's an adult, their own email is required
  if (!data.isChild && !data.email) {
    return false;
  }
  return true;
}, {
  message: "Email is required. For children, parent email is required.",
  path: ["email"]
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

const NewPlayer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
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

  const onSubmit = (data: PlayerFormValues) => {
    // In a real app, this would add to a database
    // For now, we'll use localStorage to persist the data
    const existingPlayers = JSON.parse(localStorage.getItem("players") || "[]");
    const newPlayer = {
      id: crypto.randomUUID(),
      ...data,
      age: parseInt(data.age),
      sessionsCount: 0, // New player starts with 0 sessions
    };
    
    const updatedPlayers = [...existingPlayers, newPlayer];
    localStorage.setItem("players", JSON.stringify(updatedPlayers));
    
    toast({
      title: "Player Added",
      description: `${data.name} has been added to your players list.`,
    });
    
    navigate("/players");
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <h1 className="text-2xl font-semibold">Add New Player</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to add a new player to your roster.
          </p>
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
                        <FormLabel>Parent Phone</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/players")}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-tennis-green-600 hover:bg-tennis-green-700"
              >
                Add Player
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default NewPlayer;
