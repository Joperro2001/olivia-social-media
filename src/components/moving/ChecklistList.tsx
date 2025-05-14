import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserChecklist } from "@/types/Chat";
import { fetchChecklist, useChecklist, createChecklist } from "@/utils/checklistUtils";
import { Check, FileText, Plus, FileCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const ChecklistList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const { syncLocalChecklistToDatabase } = useChecklist();
  const [showDefaultChecklist, setShowDefaultChecklist] = useState(false);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  
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
      setIsCreatingChecklist(true);
      
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
          category: "SIM Card",
          is_checked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          id: crypto.randomUUID(),
          description: "Research local mobile providers",
          category: "SIM Card",
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
        setShowDefaultChecklist(false);
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
      setIsCreatingChecklist(false);
    }
  };
  
  const handleDeletedChecklist = () => {
    setChecklist(null);
    loadChecklist();
  };

  const navigateToCategory = (category: string) => {
    // Navigate to the category page even if there might not be items yet
    // The category page will handle the empty state
    navigate(`/checklist-category/${encodeURIComponent(category)}`);
  };
  
  const renderCategoryCard = (category: string, itemCount: number = 0, completedCount: number = 0) => {
    const percentage = itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;
    return (
      <div 
        key={category} 
        className="border rounded-lg p-3 bg-white flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
        onClick={() => navigateToCategory(category)}
        role="button"
        aria-label={`View ${category} documents`}
      >
        <div className="w-full h-16 flex items-center justify-center mb-2">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            completedCount > 0 && completedCount === itemCount 
              ? "bg-primary/10" 
              : "border-2 border-dashed border-primary/40"
          }`}>
            {completedCount > 0 && completedCount === itemCount ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <span className="text-xs font-medium text-primary/80">{completedCount}/{itemCount}</span>
            )}
          </div>
        </div>
        <p className="text-sm font-medium">{category}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {itemCount === 0 ? "No items" : `${percentage}% complete`}
        </p>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
        <p className="mt-4 text-muted-foreground">{isCreatingChecklist ? "Creating your checklist..." : "Loading your checklist..."}</p>
      </div>
    );
  }
  
  // If we have a checklist, show it with clickable categories
  if (checklist) {
    const categories: {[key: string]: {total: number, completed: number}} = {};
    
    // Group items by category and count completion
    if (checklist.checklist_data?.items) {
      checklist.checklist_data.items.forEach(item => {
        const category = item.category || "General";
        if (!categories[category]) {
          categories[category] = { total: 0, completed: 0 };
        }
        categories[category].total += 1;
        if (item.is_checked) {
          categories[category].completed += 1;
        }
      });
    }
    
    return (
      <Card className="border-primary/10 hover:shadow-md transition-shadow animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Your Relocation Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Click on a category to view and manage its documents:</p>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categories).map(([category, counts], index) => (
              <div 
                key={category} 
                className="opacity-0 animate-fade-in" 
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                {renderCategoryCard(category, counts.total, counts.completed)}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/checklist-detail")}
              className="hover:shadow-sm transition-shadow"
            >
              View Full Checklist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } 
  
  // If showDefaultChecklist is true but we don't have a checklist yet, 
  // show the default checklist creation screen without the empty state
  if (showDefaultChecklist) {
    return (
      <Card className="border-primary/10 hover:shadow-md transition-shadow animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Your Relocation Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Create your personalized document checklist:</p>
          
          <div className="grid grid-cols-2 gap-3">
            {["Visa", "Health Insurance", "SIM Card", "Incoming University Documents", "Home University Documents", "Housing", "Bank Account"].map((category, index) => (
              <div 
                key={category} 
                className="opacity-0 animate-fade-in" 
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <div 
                  className="border rounded-lg p-3 bg-white flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
                >
                  <div className="w-full h-16 flex items-center justify-center mb-2">
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-primary/60" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">{category}</p>
                  <p className="text-xs text-muted-foreground mt-1">Required documents</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-4 hover:shadow-md transition-shadow" 
            onClick={handleCreateDefaultChecklist}
          >
            Create My Checklist
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Default empty state - show both cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      <Card className="border-primary/10 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Relocation Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Track your essential documents with a structured checklist:</p>
          
          <div className="grid grid-cols-2 gap-3">
            {["Visa", "Health Insurance", "SIM Card", "University Documents", "Housing", "Bank Account"].map((category, index) => (
              <div 
                key={category} 
                className="opacity-0 animate-fade-in" 
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <div 
                  className="border rounded-lg p-3 bg-white flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
                  onClick={() => navigateToCategory(category)}
                  role="button"
                  aria-label={`View ${category} documents`}
                >
                  <div className="w-full h-16 flex items-center justify-center mb-2">
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-primary/60" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">{category}</p>
                  <p className="text-xs text-muted-foreground mt-1">Not started</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-4 hover:shadow-md transition-shadow" 
            onClick={handleCreateChecklist}
          >
            Create My Checklist
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-primary/10 hover:shadow-md transition-shadow">
        <AspectRatio ratio={16/9} className="bg-muted">
          <img 
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&h=400&q=80" 
            alt="Important documents and passport" 
            className="rounded-t-lg object-cover w-full h-full"
          />
        </AspectRatio>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg mb-2">Document Preparation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a personalized document checklist for your international relocation.
            Never miss an important document or deadline again.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
              <span className="text-sm">Visa & immigration documents</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
              <span className="text-sm">University enrollment paperwork</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-primary mr-2 mt-0.5" />
              <span className="text-sm">Housing & financial arrangements</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistList;
