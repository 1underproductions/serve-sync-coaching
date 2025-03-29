
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
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const feedbackSchema = z.object({
  overallRating: z.string(),
  strengths: z.string().min(1, { message: "Please add at least one strength" }),
  improvements: z.string().min(1, { message: "Please add at least one area for improvement" }),
  suggestedDrills: z.string().optional(),
  notes: z.string().optional(),
});

const SessionFeedback = ({ session, player }) => {
  const [savedFeedback, setSavedFeedback] = useState(null);
  
  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overallRating: "3",
      strengths: "",
      improvements: "",
      suggestedDrills: "",
      notes: "",
    },
  });

  useEffect(() => {
    // Load existing feedback
    try {
      const feedbackStr = localStorage.getItem(`session_feedback_${session.id}`);
      if (feedbackStr) {
        const feedback = JSON.parse(feedbackStr);
        setSavedFeedback(feedback);
        form.reset({
          overallRating: feedback.overallRating || "3",
          strengths: feedback.strengths || "",
          improvements: feedback.improvements || "",
          suggestedDrills: feedback.suggestedDrills || "",
          notes: feedback.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    }
  }, [session.id, form]);

  const onSubmit = (data) => {
    try {
      // Save feedback to localStorage
      const timestamp = new Date().toISOString();
      const feedbackWithMeta = {
        ...data,
        playerId: player?.id,
        sessionId: session.id,
        createdAt: timestamp,
      };
      
      localStorage.setItem(`session_feedback_${session.id}`, JSON.stringify(feedbackWithMeta));
      
      // Also save to player progress history
      if (player) {
        const progressKey = `player_progress_${player.id}`;
        const existingProgressStr = localStorage.getItem(progressKey);
        const existingProgress = existingProgressStr ? JSON.parse(existingProgressStr) : [];
        
        existingProgress.push({
          id: crypto.randomUUID(),
          type: "feedback",
          sessionId: session.id,
          sessionTitle: session.title,
          date: session.date,
          data: feedbackWithMeta,
          createdAt: timestamp,
        });
        
        localStorage.setItem(progressKey, JSON.stringify(existingProgress));
      }
      
      setSavedFeedback(feedbackWithMeta);
      
      toast({
        title: "Feedback saved",
        description: "Your session feedback has been saved",
      });
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
    }
  };

  const sendFeedbackByEmail = () => {
    // In a real app, this would send an email with the feedback
    toast({
      title: "Email sent",
      description: `Feedback has been sent to ${player?.email || 'the player'}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Post-Session Feedback</CardTitle>
          <CardDescription>
            Record player performance, strengths, areas for improvement, and suggested drills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="overallRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Performance Rating</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Needs significant improvement</SelectItem>
                        <SelectItem value="2">2 - Below expectations</SelectItem>
                        <SelectItem value="3">3 - Meets expectations</SelectItem>
                        <SelectItem value="4">4 - Exceeds expectations</SelectItem>
                        <SelectItem value="5">5 - Outstanding</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="strengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strengths</FormLabel>
                    <FormDescription>
                      What did the player do well during this session?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Excellent backhand technique, good court awareness..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="improvements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas for Improvement</FormLabel>
                    <FormDescription>
                      What should the player focus on improving?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Needs work on forehand follow-through, footwork..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="suggestedDrills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggested Drills</FormLabel>
                    <FormDescription>
                      Recommend specific drills or exercises for the player to practice
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Cross-court forehand drill, serve accuracy practice..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other observations or comments..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button type="submit" className="bg-tennis-green-600 hover:bg-tennis-green-700">
                  Save Feedback
                </Button>
                {savedFeedback && player && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={sendFeedbackByEmail}
                  >
                    Send Feedback to Player
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {savedFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Feedback</CardTitle>
            <CardDescription>
              Last updated: {new Date(savedFeedback.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Overall Rating</h4>
                <p className="text-sm">
                  {savedFeedback.overallRating === "1" && "1 - Needs significant improvement"}
                  {savedFeedback.overallRating === "2" && "2 - Below expectations"}
                  {savedFeedback.overallRating === "3" && "3 - Meets expectations"}
                  {savedFeedback.overallRating === "4" && "4 - Exceeds expectations"}
                  {savedFeedback.overallRating === "5" && "5 - Outstanding"}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium">Strengths</h4>
                <p className="text-sm whitespace-pre-wrap">{savedFeedback.strengths}</p>
              </div>
              
              <div>
                <h4 className="font-medium">Areas for Improvement</h4>
                <p className="text-sm whitespace-pre-wrap">{savedFeedback.improvements}</p>
              </div>
              
              {savedFeedback.suggestedDrills && (
                <div>
                  <h4 className="font-medium">Suggested Drills</h4>
                  <p className="text-sm whitespace-pre-wrap">{savedFeedback.suggestedDrills}</p>
                </div>
              )}
              
              {savedFeedback.notes && (
                <div>
                  <h4 className="font-medium">Additional Notes</h4>
                  <p className="text-sm whitespace-pre-wrap">{savedFeedback.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionFeedback;
