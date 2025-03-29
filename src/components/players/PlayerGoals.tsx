
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
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

const goalsSchema = z.object({
  shortTerm: z.string().min(1, {
    message: "Short-term goals are required",
  }),
  midTerm: z.string().optional(),
  longTerm: z.string().optional(),
});

type PlayerGoalsFormValues = z.infer<typeof goalsSchema>;

const PlayerGoals = ({ player }) => {
  const [savedGoals, setSavedGoals] = useState(null);
  
  const form = useForm<PlayerGoalsFormValues>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      shortTerm: "",
      midTerm: "",
      longTerm: "",
    },
  });

  useEffect(() => {
    // Load existing goals
    try {
      const goalsKey = `player_goals_${player.id}`;
      const goalsStr = localStorage.getItem(goalsKey);
      if (goalsStr) {
        const goals = JSON.parse(goalsStr);
        setSavedGoals(goals);
        form.reset({
          shortTerm: goals.shortTerm || "",
          midTerm: goals.midTerm || "",
          longTerm: goals.longTerm || "",
        });
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    }
  }, [player.id, form]);

  const onSubmit = (data: PlayerGoalsFormValues) => {
    try {
      // Add metadata to goals
      const goalsData = {
        ...data,
        playerId: player.id,
        updatedAt: new Date().toISOString(),
      };
      
      // Save goals to localStorage
      const goalsKey = `player_goals_${player.id}`;
      localStorage.setItem(goalsKey, JSON.stringify(goalsData));
      
      setSavedGoals(goalsData);
      
      toast({
        title: "Goals saved",
        description: "Player development goals have been saved",
      });
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: "Error",
        description: "Failed to save goals",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="shortTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short-term Goals (1-3 months)</FormLabel>
                <FormDescription>
                  What should the player focus on achieving in the near term?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Improve forehand consistency, develop proper service motion..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="midTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mid-term Goals (3-6 months)</FormLabel>
                <FormDescription>
                  What should the player aim to achieve in 3-6 months?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Develop all-court game, increase consistency..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="longTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Long-term Goals (6-12 months)</FormLabel>
                <FormDescription>
                  What are the player's long-term aspirations?
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Compete in regional tournaments, reach NTRP 4.0 level..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="bg-tennis-green-600 hover:bg-tennis-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Goals
          </Button>
        </form>
      </Form>

      {savedGoals && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Saved Goals</CardTitle>
            <CardDescription>
              Last updated: {format(new Date(savedGoals.updatedAt), "PPP p")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedGoals.shortTerm && (
              <div>
                <h4 className="font-medium">Short-term Goals</h4>
                <p className="whitespace-pre-wrap text-sm mt-1">{savedGoals.shortTerm}</p>
              </div>
            )}
            
            {savedGoals.midTerm && (
              <div>
                <h4 className="font-medium">Mid-term Goals</h4>
                <p className="whitespace-pre-wrap text-sm mt-1">{savedGoals.midTerm}</p>
              </div>
            )}
            
            {savedGoals.longTerm && (
              <div>
                <h4 className="font-medium">Long-term Goals</h4>
                <p className="whitespace-pre-wrap text-sm mt-1">{savedGoals.longTerm}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerGoals;
