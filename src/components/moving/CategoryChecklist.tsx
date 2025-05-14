
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { fetchChecklist, updateChecklistItem, updateChecklist } from "@/utils/checklistUtils";
import { ChecklistItemData } from "@/types/Chat";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CategoryChecklist = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistExists, setChecklistExists] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemDescription, setNewItemDescription] = useState("");
  
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
        
        // Filter items for the current category
        if (checklist.checklist_data?.items) {
          const categoryItems = checklist.checklist_data.items.filter(
            item => item.category === category
          );
          setItems(categoryItems);
        }
        
      } catch (error) {
        console.error("Error loading checklist items:", error);
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
  
  const handleAddItem = async () => {
    if (!user || !category || !newItemDescription.trim()) return;
    
    try {
      // Get current checklist
      const checklist = await fetchChecklist(user.id);
      if (!checklist) {
        toast({
          title: "Error",
          description: "Checklist not found",
          variant: "destructive"
        });
        return;
      }
      
      // Create new item
      const newItem: ChecklistItemData = {
        id: crypto.randomUUID(),
        description: newItemDescription.trim(),
        category: category,
        is_checked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to existing items
      const existingItems = checklist.checklist_data?.items || [];
      const updatedItems = [...existingItems, newItem];
      
      // Update checklist
      const updated = await updateChecklist(user.id, updatedItems);
      
      if (updated) {
        // Update local state
        setItems(prevItems => [...prevItems, newItem]);
        setNewItemDescription("");
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "Item added successfully"
        });
      }
    } catch (error) {
      console.error("Error adding checklist item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };
  
  // Calculate completion status
  const totalItems = items.length;
  const completedItems = items.filter(item => item.is_checked).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
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
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    {completedItems}/{totalItems} complete
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }} 
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
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents added to {category} yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the Add button to add your {category?.toLowerCase()} documents.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item.id} 
                        checked={item.is_checked}
                        onCheckedChange={() => handleToggleItem(item)}
                      />
                      <Label 
                        htmlFor={item.id}
                        className={`text-sm ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.description}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add {category} Document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input
              placeholder="Document description"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddItem}
              disabled={!newItemDescription.trim()}
            >
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryChecklist;
