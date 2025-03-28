
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import NewSessionForm from "@/components/schedule/NewSessionForm";

const NewSession = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const navigate = useNavigate();
  
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      navigate("/schedule");
    }
  };
  
  return (
    <Layout>
      <div className="text-center py-8">
        <h1 className="text-2xl font-semibold">Create a New Session</h1>
        <p className="text-muted-foreground mt-2">
          Please fill out the form to create a new coaching session.
        </p>
      </div>
      <NewSessionForm key="new-session-form" open={isDialogOpen} onOpenChange={handleDialogOpenChange} />
    </Layout>
  );
};

export default NewSession;
