
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserChecklist } from "@/types/Chat";
import { fetchChecklist, useChecklist, createChecklist } from "@/utils/checklistUtils";
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
  const [showDefaultChecklist, setShowDefaultChecklist] = useState(false);
  
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
  
  // Check if we should show default checklist from sessionStorage
  useEffect(() => {
    const showDefault = sessionStorage.getItem("showDefaultChecklist");
    if (showDefault === "true") {
      setShowDefaultChecklist(true);
      sessionStorage.removeItem("showDefaultChecklist");
    }
  }, []);
  
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
    sessionStorage.setItem("showDefaultChecklist", "true");
    navigate("/");
  };
  
  const handleCreateDefaultChecklist = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save your checklist",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create default checklist items
      const defaultItems = [
        { 
          id: crypto.randomUUID(),
          description: "Apply for visa/residence permit",
          category: "Visa",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Get passport photos",
          category: "Visa",
          is_checked: false, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Purchase health insurance",
          category: "Health Insurance",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Get vaccination records",
          category: "Health Insurance",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Purchase international SIM card",
          category: "SIM card",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Research local mobile providers",
          category: "SIM card",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Acceptance letter",
          category: "Incoming University Documents",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Course registration confirmation",
          category: "Incoming University Documents",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Transcript of records",
          category: "Home University Documents",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Learning agreement",
          category: "Home University Documents",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Find temporary accommodation",
          category: "Housing",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Research student housing options",
          category: "Housing",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Open local bank account",
          category: "Bank Account",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Set up international transfers",
          category: "Bank Account",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Create the checklist
      const newChecklist = await createChecklist({
        items: defaultItems,
        user_id: user.id
      });
      
      if (newChecklist) {
        setChecklist(newChecklist);
        toast({
          title: "Checklist Created",
          description: "Your relocation checklist has been created successfully"
        });
      } else {
        throw new Error("Failed to create checklist");
      }
    } catch (error) {
      console.error("Error creating default checklist:", error);
      toast({
        title: "Error",
        description: "Failed to create checklist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletedChecklist = () => {
    setChecklist(null);
    loadChecklist();
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading your checklist..." />;
  }
  
  // If we have a checklist or should show the default one
  if (checklist) {
    return <ChecklistDetail checklist={checklist} onDeleted={handleDeletedChecklist} />;
  } else if (showDefaultChecklist) {
    return (
      <Card className="border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Create Your Relocation Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Let's set up your personalized relocation document checklist with all the essentials you need:</p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Visa & Residence Permit Documents</li>
            <li>Health Insurance Papers</li>
            <li>SIM Card & Communication</li>
            <li>University Documentation</li>
            <li>Housing Arrangements</li>
            <li>Banking & Financial Setup</li>
          </ul>
          
          <Button 
            className="w-full" 
            onClick={handleCreateDefaultChecklist}
          >
            Create My Checklist Now
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Default empty state
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
};

export default ChecklistList;
