
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Target } from "lucide-react";
import { format } from "date-fns";

interface ProgressEntry {
  id: string;
  date: string;
  focusArea: string;
  whatWorked: string;
  nextSession: string;
  createdAt: string;
}

const PlayerProgressSummary = ({ player }) => {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [recentNotes, setRecentNotes] = useState([]);

  useEffect(() => {
    // Load progress entries
    try {
      const progressKey = `simple_progress_${player.id}`;
      const progressStr = localStorage.getItem(progressKey);
      if (progressStr) {
        const loadedEntries = JSON.parse(progressStr);
        setEntries(loadedEntries);
      }

      // Load recent notes
      const notesKey = `player_notes_${player.id}`;
      const notesStr = localStorage.getItem(notesKey);
      if (notesStr) {
        const loadedNotes = JSON.parse(notesStr);
        setRecentNotes(loadedNotes.slice(0, 2)); // Last 2 notes
      }
    } catch (error) {
      console.error("Error loading player progress summary:", error);
    }
  }, [player.id]);

  const getLatestEntry = () => {
    return entries.length > 0 ? entries[0] : null;
  };

  const latestEntry = getLatestEntry();

  return (
    <div className="space-y-4">
      {/* Latest Session Focus */}
      {latestEntry && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Latest Session Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div>
                <Badge variant="outline" className="mb-1">
                  {format(new Date(latestEntry.date), "MMM dd")}
                </Badge>
                <p className="text-sm">{latestEntry.focusArea}</p>
              </div>
              {latestEntry.nextSession && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Next Session Plan:</div>
                  <p className="text-sm">{latestEntry.nextSession}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Notes */}
      {recentNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(note.createdAt), "MMM dd")}
                    </Badge>
                    <span className="font-medium">{note.title}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Session Notes</div>
              <div className="font-semibold">{entries.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Notes</div>
              <div className="font-semibold">{recentNotes.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerProgressSummary;
