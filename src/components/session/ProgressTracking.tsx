
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

const ProgressTracking = ({ session, player }) => {
  const navigate = useNavigate();
  const [playerProgress, setPlayerProgress] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [showFullReport, setShowFullReport] = useState(false);
  
  useEffect(() => {
    if (!player) return;
    
    try {
      // Load player progress history
      const progressKey = `player_progress_${player.id}`;
      const progressStr = localStorage.getItem(progressKey);
      
      if (progressStr) {
        const progress = JSON.parse(progressStr);
        setPlayerProgress(progress);
        
        // Extract feedback data for charts
        const feedback = progress.filter(p => p.type === "feedback");
        setFeedbackData(feedback.map(f => ({
          sessionTitle: f.sessionTitle,
          date: format(parseISO(f.date), 'MM/dd'),
          rating: parseInt(f.data.overallRating),
        })));
        
        // Count sessions per month for charts
        const sessionDates = JSON.parse(localStorage.getItem("sessions") || "[]")
          .filter(s => s.playerId === player.id)
          .map(s => ({
            date: s.date,
            month: format(parseISO(s.date), 'MMMM')
          }));
        
        const monthCounts = {};
        sessionDates.forEach(s => {
          monthCounts[s.month] = (monthCounts[s.month] || 0) + 1;
        });
        
        const sessionData = Object.keys(monthCounts).map(month => ({
          month,
          count: monthCounts[month]
        }));
        
        setSessionsData(sessionData);
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
    }
  }, [player]);

  const generateProgressReport = () => {
    setShowFullReport(true);
  };

  const getFeedbackMessages = () => {
    const recentFeedback = feedbackData.slice(-3);
    
    if (recentFeedback.length === 0) {
      return ["No feedback data available yet"];
    }
    
    const latestRating = recentFeedback[recentFeedback.length - 1]?.rating;
    const averageRating = recentFeedback.reduce((sum, item) => sum + item.rating, 0) / recentFeedback.length;
    
    const messages = [];
    
    if (latestRating >= 4) {
      messages.push("Excellent progress in recent sessions!");
    } else if (latestRating >= 3) {
      messages.push("Steady improvement in recent sessions.");
    } else if (latestRating) {
      messages.push("More practice needed based on recent feedback.");
    }
    
    if (averageRating >= 3.5) {
      messages.push("Overall performance has been consistently good.");
    } else if (averageRating >= 2.5) {
      messages.push("Overall performance shows room for improvement.");
    }
    
    if (recentFeedback.length >= 2) {
      const trend = recentFeedback[recentFeedback.length - 1].rating - recentFeedback[0].rating;
      if (trend > 0) {
        messages.push("Positive trend in performance over time.");
      } else if (trend < 0) {
        messages.push("Performance has declined recently, focus on fundamentals.");
      } else {
        messages.push("Performance has been stable over recent sessions.");
      }
    }
    
    return messages;
  };

  const exportProgressData = () => {
    try {
      // In a real app, this would generate a PDF or Excel file
      // For now, we'll just simulate with a toast message
      alert("Progress data would be exported to a file in a real application");
    } catch (error) {
      console.error("Error exporting progress data:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
          <CardDescription>
            Track player performance and growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!player ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Player data not available</p>
            </div>
          ) : playerProgress.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No progress data available yet</p>
              <p className="text-sm mt-2">
                Complete session feedback and coaching plans to start tracking progress
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Overall Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {playerProgress.filter(p => p.type === "feedback").length} sessions recorded
                  </span>
                </div>
                <Progress value={Math.min(playerProgress.length * 10, 100)} className="h-2" />
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Performance Insights</h3>
                <ul className="space-y-2">
                  {getFeedbackMessages().map((message, index) => (
                    <li key={index} className="text-sm">{message}</li>
                  ))}
                </ul>
              </div>
              
              {(feedbackData.length > 0 || sessionsData.length > 0) && (
                <Tabs defaultValue="ratings">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="ratings">Rating Trends</TabsTrigger>
                    <TabsTrigger value="sessions">Session Frequency</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ratings" className="pt-4">
                    {feedbackData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={feedbackData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[1, 5]} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="rating" 
                              stroke="#8884d8" 
                              name="Performance Rating"
                              activeDot={{ r: 8 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No rating data available yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sessions" className="pt-4">
                    {sessionsData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={sessionsData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              dataKey="count" 
                              fill="#82ca9d" 
                              name="Sessions" 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No session frequency data available yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
              
              {showFullReport && (
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Full Progress Report</h3>
                  
                  <div>
                    <h4 className="text-sm font-medium">Recent Feedback</h4>
                    <div className="space-y-2 mt-2">
                      {playerProgress
                        .filter(p => p.type === "feedback")
                        .slice(-3)
                        .map(progress => (
                          <div key={progress.id} className="border rounded p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{progress.sessionTitle}</span>
                              <span className="text-muted-foreground">
                                {format(parseISO(progress.date), "PP")}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-muted-foreground">Rating: </span>
                              <span>{progress.data.overallRating}/5</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-muted-foreground">Strengths: </span>
                              <span>{progress.data.strengths}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-muted-foreground">Areas for Improvement: </span>
                              <span>{progress.data.improvements}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Active Coaching Plans</h4>
                    <div className="space-y-2 mt-2">
                      {playerProgress
                        .filter(p => p.type === "plan")
                        .slice(-1)
                        .map(progress => (
                          <div key={progress.id} className="border rounded p-2 text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{progress.data.title}</span>
                              <span className="text-muted-foreground">
                                {format(parseISO(progress.createdAt), "PP")}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-muted-foreground">Short-Term Goals: </span>
                              <span>{progress.data.shortTermGoals}</span>
                            </div>
                            <div className="mt-1">
                              <span className="text-muted-foreground">Long-Term Goals: </span>
                              <span>{progress.data.longTermGoals}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        {player && playerProgress.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {!showFullReport && (
              <Button 
                variant="outline" 
                onClick={generateProgressReport}
              >
                Generate Progress Report
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={exportProgressData}
            >
              Export Progress Data
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ProgressTracking;
