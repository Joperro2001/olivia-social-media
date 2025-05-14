
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserChecklist } from "@/types/Chat";
import { fetchChecklist, createChecklist } from "@/utils/checklistUtils";

interface CategoryStats {
  total: number;
  completed: number;
}

interface UseCategoryChecklistReturn {
  checklist: UserChecklist | null;
  loading: boolean;
  isCreatingChecklist: boolean;
  showDefaultChecklist: boolean;
  groupedCategories: Record<string, CategoryStats>;
  loadChecklist: () => Promise<void>;
  handleCreateChecklist: () => void;
  handleCreateDefaultChecklist: () => Promise<void>;
  handleDeletedChecklist: () => void;
}

export const useCategoryChecklist = (): UseCategoryChecklistReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDefaultChecklist, setShowDefaultChecklist] = useState(false);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  
  // Group items by category and count completion (if we have a checklist)
  const groupedCategories: Record<string, CategoryStats> = {};
  
  if (checklist?.checklist_data?.items) {
    checklist.checklist_data.items.forEach(item => {
      const category = item.category || "General";
      if (!groupedCategories[category]) {
        groupedCategories[category] = {
          total: 0,
          completed: 0
        };
      }
      groupedCategories[category].total += 1;
      if (item.is_checked) {
        groupedCategories[category].completed += 1;
      }
    });
  }
  
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
  
  const handleCreateChecklist = () => {
    // Redirect to chat with Olivia to create a new checklist
    sessionStorage.setItem("autoSendMessage", "Create my relocation document checklist");
    sessionStorage.setItem("showDefaultChecklist", "true");
    window.location.href = "/";
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
      const defaultItems = [{
        id: crypto.randomUUID(),
        description: "Apply for visa/residence permit",
        category: "Visa",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Get passport photos",
        category: "Visa",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Purchase health insurance",
        category: "Health Insurance",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Get vaccination records",
        category: "Health Insurance",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Purchase international SIM card",
        category: "SIM Card",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Research local mobile providers",
        category: "SIM Card",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Acceptance letter",
        category: "Incoming University Documents",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Course registration confirmation",
        category: "Incoming University Documents",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Transcript of records",
        category: "Home University Documents",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Learning agreement",
        category: "Home University Documents",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Find temporary accommodation",
        category: "Housing",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Research student housing options",
        category: "Housing",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Open local bank account",
        category: "Bank Account",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        id: crypto.randomUUID(),
        description: "Set up international transfers",
        category: "Bank Account",
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];

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

  return {
    checklist,
    loading,
    isCreatingChecklist,
    showDefaultChecklist,
    groupedCategories,
    loadChecklist,
    handleCreateChecklist,
    handleCreateDefaultChecklist,
    handleDeletedChecklist
  };
};
