
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import NewSessionForm from "@/components/schedule/NewSessionForm";
import { toast } from "@/hooks/use-toast";

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
