
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserChecklist } from "@/types/Chat";
import { fetchChecklist, useChecklist, createChecklist } from "@/utils/checklistUtils";
import { FileText, FileCheck, Plus, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const ChecklistList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const { syncLocalChecklistToDatabase } = useChecklist();
  const [showDefaultChecklist, setShowDefaultChecklist] = useState(false);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  
  // Define standard category headers
  const standardCategories = [
    "Visa",
    "Health Insurance",
    "SIM Card",
    "Incoming University Documents",
    "Home University Documents",
    "Housing",
    "Bank Account"
  ];
  
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
      const defaultItems = standardCategories.flatMap(category => {
        switch(category) {
          case "Visa":
            return [
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
              }
            ];
          case "Health Insurance":
            return [
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
              }
            ];
          case "SIM Card":
            return [
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
              }
            ];
          case "Incoming University Documents":
            return [
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
              }
            ];
          case "Home University Documents":
            return [
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
              }
            ];
          case "Housing":
            return [
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
              }
            ];
          case "Bank Account":
            return [
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
          default:
            return [];
        }
      });

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
  
  const navigateToCategory = (category: string) => {
    navigate(`/checklist-category/${encodeURIComponent(category)}`);
  };
  
  // Get existing categories from checklist
  const existingCategories = checklist?.checklist_data?.items
    ? Array.from(new Set(checklist.checklist_data.items.map(item => item.category)))
    : [];
  
  // Combine standard categories with any additional categories from existing checklist
  const allCategories = Array.from(new Set([...standardCategories, ...existingCategories]));
  
  if (loading) {
    return <div className="flex flex-col h-64 items-center justify-center">
      <Spinner size="lg" className="text-primary" />
      <p className="mt-4 text-muted-foreground">{isCreatingChecklist ? "Creating your document list..." : "Loading your documents..."}</p>
    </div>;
  }

  return <div className="animate-fade-in w-full">
    <Card className="border-primary/10 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {checklist ? 
            <FileCheck className="h-5 w-5 text-primary" /> : 
            <FileText className="h-5 w-5 text-primary" />
          }
          <CardTitle>
            {checklist ? "Your Relocation Documents" : "Relocation Documents"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          {checklist 
            ? "Click on a category to view and manage its documents:" 
            : "Track your essential documents with a structured list:"}
        </p>
        
        {checklist ? (
          <div className="space-y-2">
            {allCategories.map((category, index) => {
              const itemsInCategory = checklist?.checklist_data?.items?.filter(item => item.category === category) || [];
              const completedItems = itemsInCategory.filter(item => item.is_checked).length;
              const totalItems = itemsInCategory.length;
              
              return (
                <div 
                  key={category} 
                  onClick={() => navigateToCategory(category)}
                  className="flex items-center justify-between p-3 bg-white hover:bg-primary/5 rounded-md border cursor-pointer opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                      totalItems > 0 && completedItems === totalItems 
                        ? "bg-primary/10" 
                        : "border-2 border-dashed border-primary/40"
                    }`}>
                      {totalItems > 0 && completedItems === totalItems ? 
                        <FileCheck className="h-4 w-4 text-primary" /> : 
                        <span className="text-xs font-medium text-primary/80">
                          {totalItems > 0 ? `${completedItems}/${totalItems}` : "0"}
                        </span>
                      }
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              );
            })}
          </div>
        ) : (
          <Button className="w-full mt-4 hover:shadow-md transition-shadow" 
            onClick={showDefaultChecklist ? handleCreateDefaultChecklist : handleCreateChecklist}>
            Create My Document List
          </Button>
        )}
      </CardContent>
    </Card>
  </div>;
};

export default ChecklistList;
