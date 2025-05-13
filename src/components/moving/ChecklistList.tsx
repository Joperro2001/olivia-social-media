
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserChecklist } from "@/types/Chat";
import { fetchUserChecklists, useChecklist } from "@/utils/checklistUtils";
import { Package, FileText } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ChecklistDetail from "@/components/moving/ChecklistDetail";

const ChecklistList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<UserChecklist[]>([]);
  const [activeChecklist, setActiveChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const { syncLocalChecklistToDatabase } = useChecklist();
  
  const loadChecklists = async () => {
    setLoading(true);
    try {
      const data = await fetchUserChecklists();
      setChecklists(data);
      
      // If we have exactly one checklist, select it automatically
      if (data.length === 1) {
        handleSelectChecklist(data[0]);
      }
    } catch (error) {
      console.error("Error loading checklists:", error);
      toast({
        title: "Error",
        description: "Failed to load your checklists",
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
        loadChecklists();
        
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
  
  const handleSelectChecklist = async (checklist: UserChecklist) => {
    // Navigate to the detailed view
    navigate(`/checklist/${checklist.checklist_id}`);
  };
  
  const handleCreateChecklist = () => {
    // Redirect to chat with Olivia to create a new checklist
    sessionStorage.setItem("autoSendMessage", "Create my relocation document checklist");
    navigate("/");
  };
  
  const handleDeletedChecklist = () => {
    setActiveChecklist(null);
    loadChecklists();
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading your checklists..." />;
  }
  
  if (checklists.length === 0) {
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
  
  if (checklists.length === 1 && activeChecklist) {
    return <ChecklistDetail checklist={activeChecklist} onDeleted={handleDeletedChecklist} />;
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checklists.map(checklist => (
          <Card 
            key={checklist.checklist_id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSelectChecklist(checklist)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{checklist.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{checklist.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>{new Date(checklist.created_at).toLocaleDateString()}</span>
                <span>{checklist.checklist_id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
          onClick={handleCreateChecklist}
        >
          <CardContent className="h-full flex flex-col items-center justify-center py-6">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-center font-medium">Create New Checklist</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChecklistList;
