
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Target, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface ProgressEntry {
  id: string;
  date: string;
  focusArea: string;
  whatWorked: string;
  nextSession: string;
  createdAt: string;
}

const SimpleProgressTracking = ({ player }) => {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    focusArea: "",
    whatWorked: "",
    nextSession: ""
  });

  useEffect(() => {
    // Load existing progress entries
    try {
      const progressKey = `simple_progress_${player.id}`;
      const progressStr = localStorage.getItem(progressKey);
      if (progressStr) {
        const loadedEntries = JSON.parse(progressStr);
        setEntries(loadedEntries);
      }
    } catch (error) {
      console.error("Error loading progress entries:", error);
    }
  }, [player.id]);

  const addEntry = () => {
    if (!newEntry.focusArea.trim()) {
      toast({
        title: "Focus area required",
        description: "Please enter what you focused on this session",
        variant: "destructive"
      });
      return;
    }

    try {
      const entry: ProgressEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        focusArea: newEntry.focusArea,
        whatWorked: newEntry.whatWorked,
        nextSession: newEntry.nextSession,
        createdAt: new Date().toISOString()
      };

      const updatedEntries = [entry, ...entries];
      setEntries(updatedEntries);

      // Save to localStorage
      const progressKey = `simple_progress_${player.id}`;
      localStorage.setItem(progressKey, JSON.stringify(updatedEntries));

      // Reset form
      setNewEntry({ focusArea: "", whatWorked: "", nextSession: "" });
      setIsAdding(false);

      toast({
        title: "Progress entry added",
        description: "Your session notes have been saved"
      });
    } catch (error) {
      console.error("Error saving progress entry:", error);
      toast({
        title: "Error",
        description: "Failed to save progress entry",
        variant: "destructive"
      });
    }
  };

  const getLatestEntry = () => {
    return entries.length > 0 ? entries[0] : null;
  };

  const latestEntry = getLatestEntry();

  return (
    <div className="space-y-6">
      {/* Quick Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestEntry ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Session Focus</div>
                <div className="text-sm">{latestEntry.focusArea}</div>
              </div>
              {latestEntry.nextSession && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Next Session Plan</div>
                  <div className="text-sm">{latestEntry.nextSession}</div>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {format(new Date(latestEntry.date), "PPP")}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No session notes yet. Add your first entry below.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Session Notes
            </CardTitle>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            )}
          </div>
        </CardHeader>
        {isAdding && (
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">What did you focus on today? *</label>
              <Input
                placeholder="e.g., Forehand technique, footwork drills, serve practice"
                value={newEntry.focusArea}
                onChange={(e) => setNewEntry({ ...newEntry, focusArea: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">What worked well / Key improvements?</label>
              <Textarea
                placeholder="e.g., Better follow-through on forehand, improved court positioning"
                value={newEntry.whatWorked}
                onChange={(e) => setNewEntry({ ...newEntry, whatWorked: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Next session plan</label>
              <Textarea
                placeholder="e.g., Continue forehand work, add backhand drills, work on serve consistency"
                value={newEntry.nextSession}
                onChange={(e) => setNewEntry({ ...newEntry, nextSession: e.target.value })}
                className="mt-1 min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addEntry} className="bg-tennis-green-600 hover:bg-tennis-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Notes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewEntry({ focusArea: "", whatWorked: "", nextSession: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Progress History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No session history yet. Add your first entry to start tracking progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border-l-2 border-tennis-green-200 pl-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {format(new Date(entry.date), "PPP")}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Badge variant="outline" className="mb-1">Focus Area</Badge>
                      <p className="text-sm">{entry.focusArea}</p>
                    </div>
                    
                    {entry.whatWorked && (
                      <div>
                        <Badge variant="outline" className="mb-1">What Worked</Badge>
                        <p className="text-sm">{entry.whatWorked}</p>
                      </div>
                    )}
                    
                    {entry.nextSession && (
                      <div>
                        <Badge variant="outline" className="mb-1">Next Session</Badge>
                        <p className="text-sm">{entry.nextSession}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleProgressTracking;
