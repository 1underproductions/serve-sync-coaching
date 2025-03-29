
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import NewSessionForm from "@/components/schedule/NewSessionForm";
import { toast } from "@/hooks/use-toast";
import { scheduleReminders } from "@/utils/reminderService";

const NewSession = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const navigate = useNavigate();
  
  // Get existing sessions from localStorage
  useEffect(() => {
    // Initialize sessions in localStorage if they don't exist
    const existingSessions = localStorage.getItem("sessions");
    if (!existingSessions) {
      localStorage.setItem("sessions", JSON.stringify([]));
    }
  }, []);
  
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      navigate("/schedule");
    }
  };
  
  // Handle successful session creation
  const handleSessionCreated = () => {
    toast({
      title: "Success",
      description: "Session(s) have been scheduled successfully",
    });
    
    // Schedule reminders for the new sessions if enabled in settings
    try {
      // Get the latest sessions from localStorage
      const sessionsJson = localStorage.getItem("sessions");
      if (sessionsJson) {
        const sessions = JSON.parse(sessionsJson);
        scheduleReminders(sessions);
      }
    } catch (error) {
      console.error("Failed to schedule reminders:", error);
      // Don't show an error to the user for this - it's a background process
    }
    
    navigate("/schedule");
  };
  
  return (
    <Layout>
      <div className="text-center py-8">
        <h1 className="text-2xl font-semibold">Create a New Session</h1>
        <p className="text-muted-foreground mt-2">
          Please fill out the form to create a new coaching session.
        </p>
      </div>
      <NewSessionForm 
        key="new-session-form" 
        open={isDialogOpen} 
        onOpenChange={handleDialogOpenChange} 
        onSessionCreated={handleSessionCreated}
      />
    </Layout>
  );
};

export default NewSession;
