
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
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
  
  useEffect(() => {
    const loadChecklist = async () => {
      if (!user) {
        navigate("/my-city-packer");
        return;
      }
      
      try {
        setLoading(true);
        const checklist = await fetchChecklist(user.id);
        
        if (!checklist?.checklist_data?.items) {
          toast({
            title: "Checklist not found",
            description: "Please create a checklist first",
            variant: "destructive"
          });
          navigate("/my-city-packer");
          return;
        }
        
        // Filter items by category
        const categoryItems = checklist.checklist_data.items.filter(
          item => item.category === category
        );
        
        if (categoryItems.length === 0) {
          toast({
            title: "No items found",
            description: `No items found for category: ${category}`,
            variant: "destructive"
          });
        }
        
        setItems(categoryItems);
      } catch (error) {
        console.error("Error loading checklist items:", error);
        toast({
          title: "Error",
          description: "Failed to load checklist items",
          variant: "destructive"
        });
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
  
  // Calculate completion status
  const totalItems = items.length;
  const completedItems = items.filter(item => item.is_checked).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  if (loading) {
    return <LoadingSpinner message={`Loading ${category} documents...`} />;
  }
  
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
              Track your required {category.toLowerCase()} documents
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Required Documents</CardTitle>
              <div className="text-sm">
                {completedItems}/{totalItems} complete
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={item.is_checked}
                      onCheckedChange={() => handleToggleItem(item)}
                    />
                    <Label
                      htmlFor={item.id}
                      className={`cursor-pointer ${item.is_checked ? "line-through text-muted-foreground" : ""}`}
                    >
                      {item.description}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No documents found for this category</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryChecklist;
