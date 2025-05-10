
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface PackingListProps {
  type: "pack" | "arrange" | "know";
  destination: string;
  purpose: string;
}

interface ListItem {
  id: string;
  text: string;
  checked: boolean;
  category?: string;
}

const PackingList: React.FC<PackingListProps> = ({ type, destination, purpose }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ListItem[]>(getItemsForType(type, destination, purpose));
  
  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };
  
  const handleSave = () => {
    toast({
      title: "List Saved",
      description: "Your list has been saved! In the full version, you'll be able to export it."
    });
  };
  
  // Group items by category
  const groupedItems: Record<string, ListItem[]> = {};
  items.forEach(item => {
    const category = item.category || "General";
    if (!groupedItems[category]) {
      groupedItems[category] = [];
    }
    groupedItems[category].push(item);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id} 
                    checked={item.checked} 
                    onCheckedChange={() => toggleItem(item.id)}
                  />
                  <Label 
                    htmlFor={item.id}
                    className={`cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.text}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
          <Download className="h-4 w-4" />
          Save List
        </Button>
      </div>
    </div>
  );
};

function getItemsForType(type: "pack" | "arrange" | "know", destination: string, purpose: string): ListItem[] {
  // In a real app, this would be more sophisticated based on destination, weather, etc.
  
  if (type === "pack") {
    return [
      { id: "pack-1", text: "Passport and ID documents", checked: false, category: "Documents" },
      { id: "pack-2", text: "Weather-appropriate clothing", checked: false, category: "Clothing" },
      { id: "pack-3", text: "Travel adapters for electronics", checked: false, category: "Electronics" },
      { id: "pack-4", text: "Medications and prescriptions", checked: false, category: "Health" },
      { id: "pack-5", text: "Laptop and charger", checked: false, category: "Electronics" },
      { id: "pack-6", text: "Phone and charger", checked: false, category: "Electronics" },
      { id: "pack-7", text: "Toiletries and personal care items", checked: false, category: "Personal Care" },
      { id: "pack-8", text: "Comfortable shoes for walking", checked: false, category: "Clothing" },
    ];
  } else if (type === "arrange") {
    return [
      { id: "arr-1", text: "Visa application and documents", checked: false, category: "Legal" },
      { id: "arr-2", text: "Health insurance for your stay", checked: false, category: "Insurance" },
      { id: "arr-3", text: "Accommodation booking/rental", checked: false, category: "Housing" },
      { id: "arr-4", text: "Transfer money to local bank account", checked: false, category: "Financial" },
      { id: "arr-5", text: "Research local transportation options", checked: false, category: "Transport" },
      { id: "arr-6", text: "Make copies of important documents", checked: false, category: "Legal" },
      { id: "arr-7", text: "Notify your bank about travel", checked: false, category: "Financial" },
      { id: "arr-8", text: "Set up international phone plan", checked: false, category: "Communication" },
    ];
  } else { // to know
    return [
      { id: "know-1", text: "Local emergency numbers", checked: false, category: "Safety" },
      { id: "know-2", text: "Basic phrases in local language", checked: false, category: "Culture" },
      { id: "know-3", text: "How to use public transportation", checked: false, category: "Transport" },
      { id: "know-4", text: "Location of nearest embassy/consulate", checked: false, category: "Safety" },
      { id: "know-5", text: "Cultural norms and customs", checked: false, category: "Culture" },
      { id: "know-6", text: "Local banking/payment methods", checked: false, category: "Financial" },
      { id: "know-7", text: "Healthcare system basics", checked: false, category: "Health" },
      { id: "know-8", text: "Common scams to avoid", checked: false, category: "Safety" },
    ];
  }
}

export default PackingList;
