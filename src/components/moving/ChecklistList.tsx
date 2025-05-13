
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserChecklist } from "@/types/Chat";
import { fetchChecklist, useChecklist } from "@/utils/checklistUtils";
import { FileText } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ChecklistDetail from "@/components/moving/ChecklistDetail";

const ChecklistList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const { syncLocalChecklistToDatabase } = useChecklist();
  
  const loadChecklist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await fetchChecklist(user.id);
      setChecklist(data);
    } catch (error) {
      console.error("Error loading checklist:", error);
      toast({
        title: "Error",
        description: "Failed to load your checklist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Sync local storage checklist to database on initial load if user is logged in
  useEffect(() => {
    if (user) {
      const syncAndLoad = async () => {
        const syncedChecklist = await syncLocalChecklistToDatabase();
        loadChecklist();
        
        if (syncedChecklist) {
          toast({
            title: "Checklist Synced",
            description: "Your checklist has been saved to your account"
          });
        }
      };
      
      syncAndLoad();
    }
  }, [user]);
  
  const handleCreateChecklist = () => {
    // Redirect to chat with Olivia to create a new checklist
    sessionStorage.setItem("autoSendMessage", "Create my relocation document checklist");
    navigate("/");
  };
  
  const handleDeletedChecklist = () => {
    setChecklist(null);
    loadChecklist();
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading your checklist..." />;
  }
  
  if (!checklist) {
    return (
      <Card className="border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>You Don't Have a Relocation Checklist Yet</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You haven't created a relocation document checklist yet. Let Olivia help you build a personalized checklist with all the essential documents and requirements for your international move.</p>
          
          <img 
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&h=400&q=80" 
            alt="Important documents and passport" 
            className="rounded-lg mb-6 w-full max-w-md object-cover h-48 mx-auto"
          />
          
          <Button 
            className="w-full" 
            onClick={handleCreateChecklist}
          >
            Create My Checklist
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return <ChecklistDetail checklist={checklist} onDeleted={handleDeletedChecklist} />;
};

export default ChecklistList;
