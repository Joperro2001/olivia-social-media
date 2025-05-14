
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchChecklist, updateChecklistItem } from "@/utils/checklistUtils";
import { ChecklistItemData } from "@/types/Chat";

const CategoryChecklist = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistExists, setChecklistExists] = useState(true);
  
  useEffect(() => {
    const loadChecklist = async () => {
      if (!user) {
        navigate("/my-city-packer");
        return;
      }
      
      try {
        setLoading(true);
        const checklist = await fetchChecklist(user.id);
        
        // If checklist doesn't exist at all, show empty state but don't redirect
        if (!checklist) {
          setChecklistExists(false);
          setLoading(false);
          return;
        }
        
        // For now, always show empty state regardless of whether items exist
        // This will be populated by AI in the future
        setItems([]);
        
      } catch (error) {
        console.error("Error loading checklist items:", error);
        // Don't show error toast, just set empty items
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadChecklist();
  }, [user, category, navigate, toast]);
  
  const handleToggleItem = async (item: ChecklistItemData) => {
    if (!user) return;
    
    try {
      const updated = await updateChecklistItem(
        user.id,
        item.id,
        !item.is_checked
      );
      
      if (updated) {
        // Update local state
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
          )
        );
      }
    } catch (error) {
      console.error("Error updating checklist item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };
  
  // Calculate completion status - always 0 for now since items are empty
  const totalItems = 0;
  const completedItems = 0;
  const completionPercentage = 0;
  
  return (
    <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/my-city-packer")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{category} Documents</h1>
            <p className="text-sm text-muted-foreground">
              Track your required {category?.toLowerCase()} documents
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        {loading ? (
          <div className="flex flex-col h-64 items-center justify-center">
            <Spinner size="lg" className="text-primary" />
            <p className="mt-4 text-muted-foreground">Loading {category} documents...</p>
          </div>
        ) : (
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Required Documents</CardTitle>
                <div className="text-sm">
                  0/0 complete
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `0%` }} 
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {!checklistExists ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No checklist found. Create a checklist first.</p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => navigate("/my-city-packer")}
                  >
                    Back to Document Tracker
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents found for {category}.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This category is empty. Documents will be added by AI based on your relocation needs.
                  </p>
                  <Button 
                    className="mt-4" 
                    variant="outline" 
                    onClick={() => navigate("/my-city-packer")}
                  >
                    Back to Document Tracker
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryChecklist;
