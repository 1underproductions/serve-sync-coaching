
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, addMonths } from "date-fns";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Save, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const milestoneSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  targetDate: z.date(),
});

const planSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  shortTermGoals: z.string(),
  longTermGoals: z.string(),
  assignedDrills: z.string(),
  milestones: z.array(milestoneSchema).optional(),
  sendToPLayer: z.boolean().default(false),
});

const CoachingPlan = ({ session, player }) => {
  const [savedPlan, setSavedPlan] = useState(null);
  const [milestones, setMilestones] = useState([
    { id: "1", title: "", description: "", targetDate: addMonths(new Date(), 1) }
  ]);
  
  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      title: `${player?.name || 'Player'}'s Development Plan`,
      description: "",
      shortTermGoals: "",
      longTermGoals: "",
      assignedDrills: "",
      sendToPLayer: false,
    },
  });

  useEffect(() => {
    // Load existing plan
    try {
      const planStr = localStorage.getItem(`coaching_plan_${player?.id}_${session.id}`);
      if (planStr) {
        const plan = JSON.parse(planStr);
        setSavedPlan(plan);
        
        if (plan.milestones && plan.milestones.length > 0) {
          const parsedMilestones = plan.milestones.map(m => ({
            ...m,
            targetDate: new Date(m.targetDate),
            id: m.id || crypto.randomUUID()
          }));
          setMilestones(parsedMilestones);
        }
        
        form.reset({
          title: plan.title,
          description: plan.description,
          shortTermGoals: plan.shortTermGoals || "",
          longTermGoals: plan.longTermGoals || "",
          assignedDrills: plan.assignedDrills || "",
          sendToPLayer: false,
        });
      }
    } catch (error) {
      console.error("Error loading coaching plan:", error);
    }
  }, [session.id, player?.id, form]);

  const onSubmit = (data) => {
    try {
      // Add milestones to the data
      const milestonesWithIds = milestones.map(m => ({
        ...m,
        id: m.id || crypto.randomUUID()
      }));
      
      const planData = {
        ...data,
        milestones: milestonesWithIds,
        playerId: player?.id,
        sessionId: session.id,
        createdAt: new Date().toISOString(),
      };
      
      // Save plan to localStorage
      localStorage.setItem(`coaching_plan_${player?.id}_${session.id}`, JSON.stringify(planData));
      
      // Also save to player progress history
      if (player) {
        const progressKey = `player_progress_${player.id}`;
        const existingProgressStr = localStorage.getItem(progressKey);
        const existingProgress = existingProgressStr ? JSON.parse(existingProgressStr) : [];
        
        // Check if we already have a plan in the progress
        const existingPlanIndex = existingProgress.findIndex(p => 
          p.type === "plan" && p.sessionId === session.id
        );
        
        if (existingPlanIndex >= 0) {
          // Update existing plan
          existingProgress[existingPlanIndex].data = planData;
          existingProgress[existingPlanIndex].updatedAt = new Date().toISOString();
        } else {
          // Add new plan
          existingProgress.push({
            id: crypto.randomUUID(),
            type: "plan",
            sessionId: session.id,
            sessionTitle: session.title,
            date: session.date,
            data: planData,
            createdAt: new Date().toISOString(),
          });
        }
        
        localStorage.setItem(progressKey, JSON.stringify(existingProgress));
      }
      
      setSavedPlan(planData);
      
      if (data.sendToPLayer && player?.email) {
        // In a real app, this would send the plan to the player via email
        toast({
          title: "Plan sent",
          description: `The coaching plan has been sent to ${player.email}`,
        });
        
        // Reset the switch
        form.setValue("sendToPLayer", false);
      } else {
        toast({
          title: "Plan saved",
          description: "Your coaching plan has been saved",
        });
      }
    } catch (error) {
      console.error("Error saving coaching plan:", error);
      toast({
        title: "Error",
        description: "Failed to save coaching plan",
        variant: "destructive",
      });
    }
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        targetDate: addMonths(new Date(), 1),
      }
    ]);
  };

  const removeMilestone = (index) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };

  const updateMilestone = (index, field, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    setMilestones(updatedMilestones);
  };

  const sendPlanByEmail = () => {
    if (!player?.email) {
      toast({
        title: "Error",
        description: "Player email not available",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would send an email with the plan
    toast({
      title: "Plan sent",
      description: `Coaching plan has been sent to ${player.email}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coaching Plan</CardTitle>
          <CardDescription>
            Create a structured development plan with milestones and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Overview</FormLabel>
                    <FormDescription>
                      Provide a general overview of this coaching plan
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. This plan focuses on developing forehand technique and match strategy..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shortTermGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short-term Goals (1-3 months)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Improve forehand consistency, develop proper service motion..."
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
                  name="longTermGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long-term Goals (6-12 months)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. Compete in regional tournaments, develop all-court game..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="assignedDrills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Drills & Exercises</FormLabel>
                    <FormDescription>
                      Specify drills, exercises or match play goals for the player to practice
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. 30 minutes of cross-court forehand drills daily, 20 serves to each service box..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Milestones</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addMilestone}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Milestone
                  </Button>
                </div>
                
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border rounded-md p-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => removeMilestone(index)}
                      disabled={milestones.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FormLabel htmlFor={`milestone-${index}-title`}>Milestone Title</FormLabel>
                        <Input
                          id={`milestone-${index}-title`}
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder="e.g. Master topspin backhand"
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor={`milestone-${index}-description`}>Description</FormLabel>
                        <Textarea
                          id={`milestone-${index}-description`}
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          placeholder="Describe this milestone in detail..."
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor={`milestone-${index}-date`}>Target Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={`milestone-${index}-date`}
                              variant={"outline"}
                              className={cn(
                                "justify-start text-left font-normal",
                                !milestone.targetDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {milestone.targetDate ? format(milestone.targetDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={milestone.targetDate}
                              onSelect={(date) => updateMilestone(index, 'targetDate', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <FormField
                control={form.control}
                name="sendToPLayer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Send to Player</FormLabel>
                      <FormDescription>
                        Send this plan to {player?.email || 'the player'} by email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  type="submit"
                  className="bg-tennis-green-600 hover:bg-tennis-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Plan
                </Button>
                {savedPlan && player && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={sendPlanByEmail}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Plan to Player
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {savedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Coaching Plan</CardTitle>
            <CardDescription>
              Last updated: {new Date(savedPlan.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="overview">
                <AccordionTrigger>Plan Overview</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-2">
                    <h3 className="font-medium">{savedPlan.title}</h3>
                    <p className="text-sm whitespace-pre-wrap">{savedPlan.description}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="goals">
                <AccordionTrigger>Goals</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    <div>
                      <h4 className="font-medium">Short-term Goals (1-3 months)</h4>
                      <p className="text-sm whitespace-pre-wrap">{savedPlan.shortTermGoals}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Long-term Goals (6-12 months)</h4>
                      <p className="text-sm whitespace-pre-wrap">{savedPlan.longTermGoals}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="drills">
                <AccordionTrigger>Assigned Drills & Exercises</AccordionTrigger>
                <AccordionContent>
                  <div className="p-2">
                    <p className="text-sm whitespace-pre-wrap">{savedPlan.assignedDrills}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="milestones">
                <AccordionTrigger>Milestones</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    {savedPlan.milestones && savedPlan.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="border rounded p-3">
                        <h4 className="font-medium">{milestone.title || `Milestone ${index + 1}`}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target date: {format(new Date(milestone.targetDate), "PPP")}
                        </p>
                        {milestone.description && (
                          <p className="text-sm mt-2">{milestone.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sendPlanByEmail}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Plan to Player
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CoachingPlan;
