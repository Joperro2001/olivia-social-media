
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { fetchChecklist, updateChecklistItem } from "@/utils/checklistUtils";
import { Spinner } from "@/components/ui/spinner";
import { UserChecklist, ChecklistItemData } from "@/types/Chat";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const CategoryChecklist: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = category ? decodeURIComponent(category) : "";
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<UserChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  
  // Load the checklist data
  useEffect(() => {
    const loadChecklist = async () => {
      if (!user) {
        navigate("/");
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchChecklist(user.id);
        setChecklist(data);
      } catch (error) {
        console.error("Error loading category checklist:", error);
        toast({
          title: "Error",
          description: "Failed to load category items",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadChecklist();
  }, [user, navigate, toast]);
  
  // Filter items by the selected category
  const categoryItems = checklist?.checklist_data?.items.filter(
    (item) => item.category === decodedCategory
  ) || [];
  
  // Handle toggling the checkbox status
  const handleToggleItem = async (itemId: string, isChecked: boolean) => {
    if (!user) return;
    
    try {
      setUpdatingItem(itemId);
      await updateChecklistItem(user.id, itemId, isChecked);
      
      // Update local state to reflect the change
      setChecklist((prevChecklist) => {
        if (!prevChecklist) return null;
        
        const updatedItems = prevChecklist.checklist_data.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, is_checked: isChecked };
          }
          return item;
        });
        
        return {
          ...prevChecklist,
          checklist_data: {
            ...prevChecklist.checklist_data,
            items: updatedItems
          }
        };
      });
      
      toast({
        title: isChecked ? "Item checked" : "Item unchecked",
        description: isChecked ? "Document marked as ready" : "Document marked as pending"
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive"
      });
    } finally {
      setUpdatingItem(null);
    }
  };
  
  if (loading) {
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
            <h1 className="text-2xl font-bold truncate">{decodedCategory}</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" className="text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/my-city-packer")}
            className="mr-2 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold truncate">{decodedCategory}</h1>
        </div>
      </div>
      <div className="px-4 pb-28 flex-grow">
        {categoryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-lg text-muted-foreground">No documents found for this category</p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/my-city-packer")}
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-3"
              >
                <div className="relative flex-shrink-0">
                  {updatingItem === item.id ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                      <Spinner size="sm" className="text-primary" />
                    </div>
                  ) : (
                    <Checkbox
                      checked={item.is_checked}
                      onCheckedChange={(checked) => 
                        handleToggleItem(item.id, Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                  )}
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className={`${item.is_checked ? 'line-through text-muted-foreground' : 'text-app-text'} text-md break-words`}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryChecklist;
