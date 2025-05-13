
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash, Download, Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserChecklist, ChecklistItemData } from "@/types/Chat";
import { updateChecklistItem, deleteChecklist } from "@/utils/checklistUtils";
import { useNavigate } from "react-router-dom";

interface ChecklistDetailProps {
  checklist: UserChecklist;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const ChecklistDetail = ({ checklist, onDeleted, onUpdated }: ChecklistDetailProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<Record<string, ChecklistItemData[]>>({});
  
  useEffect(() => {
    if (checklist?.checklist_data?.items) {
      // Group items by category
      const grouped = checklist.checklist_data.items.reduce((acc, item) => {
        const category = item.category || "General";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, ChecklistItemData[]>);
      
      setItems(grouped);
    }
  }, [checklist]);
  
  const handleToggleItem = async (item: ChecklistItemData) => {
    try {
      const updated = await updateChecklistItem(
        checklist.checklist_id,
        item.id,
        !item.is_checked
      );
      
      if (updated) {
        // Update local state
        setItems(prevItems => {
          const category = item.category || "General";
          const updatedItems = { ...prevItems };
          
          if (updatedItems[category]) {
            updatedItems[category] = updatedItems[category].map(i => 
              i.id === item.id ? { ...i, is_checked: !i.is_checked } : i
            );
          }
          
          return updatedItems;
        });
        
        if (onUpdated) {
          onUpdated();
        }
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
  
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this checklist?")) {
      try {
        const success = await deleteChecklist(checklist.checklist_id);
        
        if (success) {
          toast({
            title: "Success",
            description: "Checklist deleted successfully"
          });
          
          if (onDeleted) {
            onDeleted();
          } else {
            navigate("/my-city-packer");
          }
        } else {
          throw new Error("Failed to delete checklist");
        }
      } catch (error) {
        console.error("Error deleting checklist:", error);
        toast({
          title: "Error",
          description: "Failed to delete checklist",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleExport = () => {
    try {
      // Create text content for the checklist
      let content = `# ${checklist.title}\n\n`;
      content += `Destination: ${checklist.description || "Unknown"}\n\n`;
      
      // Add items grouped by category
      Object.entries(items).forEach(([category, categoryItems]) => {
        content += `## ${category}\n\n`;
        categoryItems.forEach(item => {
          content += `- [${item.is_checked ? 'x' : ' '}] ${item.description}\n`;
        });
        content += '\n';
      });
      
      // Create a downloadable link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${checklist.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Checklist exported successfully"
      });
    } catch (error) {
      console.error("Error exporting checklist:", error);
      toast({
        title: "Error",
        description: "Failed to export checklist",
        variant: "destructive"
      });
    }
  };
  
  // Calculate completion percentage
  const totalItems = checklist?.checklist_data?.items?.length || 0;
  const checkedItems = checklist?.checklist_data?.items?.filter(item => item.is_checked)?.length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  
  const renderCategoriesAsTabTriggers = () => {
    // Sort categories in a logical order
    const categoryOrder = [
      "Visa & Immigration", 
      "Health & Insurance", 
      "Education", 
      "Employment", 
      "Housing", 
      "Finance", 
      "Communication", 
      "Travel", 
      "Personal"
    ];
    
    // Get all categories and sort them
    const categories = Object.keys(items);
    categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      
      // If both are found in the order array, sort by that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is found, prioritize the one in the order array
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is found, sort alphabetically
      return a.localeCompare(b);
    });
    
    return categories.map(category => (
      <TabsTrigger key={category} value={category}>
        {category}
      </TabsTrigger>
    ));
  };
  
  const renderCategoriesAsTabsContent = () => {
    return Object.entries(items).map(([category, categoryItems]) => (
      <TabsContent key={category} value={category} className="space-y-4 pt-2">
        {categoryItems.map(item => (
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
      </TabsContent>
    ));
  };
  
  if (!checklist || !checklist.checklist_data) {
    return <div>No checklist data available</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>{checklist.title}</CardTitle>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{checklist.description}</p>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
            <span className="text-xs font-medium ml-2">
              {completionPercentage}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground ml-2">
            {checkedItems}/{totalItems} items
          </div>
        </div>
        
        {Object.keys(items).length > 0 ? (
          <Tabs defaultValue={Object.keys(items)[0]} className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              {renderCategoriesAsTabTriggers()}
            </TabsList>
            {renderCategoriesAsTabsContent()}
          </Tabs>
        ) : (
          <p className="text-center text-muted-foreground py-8">No items in this checklist</p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChecklistDetail;
