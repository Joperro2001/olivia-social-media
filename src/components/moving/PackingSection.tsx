
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Luggage, FileCheck, Globe } from "lucide-react";
import PackingList from "./PackingList";
import { useAuth } from "@/context/AuthContext";
import { createChecklist } from "@/utils/checklistUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const PackingSection: React.FC = () => {
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("");
  const [showList, setShowList] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleGenerateList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a basic checklist based on destination and purpose
    if (user) {
      try {
        // Generate sample items for the checklist
        const items = getInitialPackingItems(destination, purpose);
        
        // Create the checklist in the database with the simplified schema
        await createChecklist({
          items,
          user_id: user.id
        });
        
        toast({
          title: "Success",
          description: "Your relocation checklist has been created!"
        });
        
        // Navigate to the checklist page
        navigate("/my-city-packer");
      } catch (error) {
        console.error("Error creating checklist:", error);
        toast({
          title: "Error",
          description: "Failed to create your checklist"
        });
      }
    } else {
      // For non-logged in users, just show the list locally
      setShowList(true);
    }
  };
  
  const handleReset = () => {
    setShowList(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Luggage className="h-5 w-5 text-primary" />
          <CardTitle>Packing & Preparation List</CardTitle>
        </div>
        <CardDescription>
          Create a personalized packing and preparation list for your move
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!showList ? (
          <form onSubmit={handleGenerateList} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-medium">
                Where are you moving to?
              </label>
              <Input 
                id="destination" 
                placeholder="e.g., Berlin, Tokyo, New York" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="purpose" className="text-sm font-medium">
                Purpose of your move
              </label>
              <Input 
                id="purpose" 
                placeholder="e.g., Study, Work, Explore" 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration of stay
              </label>
              <Input 
                id="duration" 
                placeholder="e.g., 3 months, 1 year, Permanent" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Generate Packing List
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p>
                <strong>Destination:</strong> {destination}
              </p>
              <p>
                <strong>Purpose:</strong> {purpose}
              </p>
              <p>
                <strong>Duration:</strong> {duration}
              </p>
            </div>
            
            <Tabs defaultValue="pack">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="pack" className="flex items-center gap-2">
                  <Luggage className="w-4 h-4" />
                  <span>To Pack</span>
                </TabsTrigger>
                <TabsTrigger value="arrange" className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  <span>To Arrange</span>
                </TabsTrigger>
                <TabsTrigger value="know" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>To Know</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pack" className="mt-4">
                <PackingList 
                  type="pack" 
                  destination={destination} 
                  purpose={purpose} 
                />
              </TabsContent>
              
              <TabsContent value="arrange" className="mt-4">
                <PackingList 
                  type="arrange" 
                  destination={destination} 
                  purpose={purpose} 
                />
              </TabsContent>
              
              <TabsContent value="know" className="mt-4">
                <PackingList 
                  type="know" 
                  destination={destination} 
                  purpose={purpose} 
                />
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleReset}>
                Create New List
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to generate initial packing items
function getInitialPackingItems(destination: string, purpose: string) {
  // Create a basic list of items based on destination and purpose
  const items = [
    { 
      id: crypto.randomUUID(),
      description: "Passport and ID documents",
      is_checked: false,
      category: "Documents"
    },
    { 
      id: crypto.randomUUID(),
      description: "Visa application documents",
      is_checked: false,
      category: "Legal"
    },
    { 
      id: crypto.randomUUID(),
      description: "Travel insurance",
      is_checked: false,
      category: "Insurance"
    },
    { 
      id: crypto.randomUUID(),
      description: "Accommodation booking confirmation",
      is_checked: false,
      category: "Housing"
    },
    { 
      id: crypto.randomUUID(),
      description: "Flight tickets",
      is_checked: false,
      category: "Travel"
    },
    { 
      id: crypto.randomUUID(),
      description: "Bank statements",
      is_checked: false,
      category: "Financial"
    }
  ];
  
  // Add some study-specific items
  if (purpose.toLowerCase().includes("study")) {
    items.push(
      { 
        id: crypto.randomUUID(),
        description: "University acceptance letter",
        is_checked: false,
        category: "Education"
      },
      { 
        id: crypto.randomUUID(),
        description: "Student ID",
        is_checked: false,
        category: "Education"
      },
      { 
        id: crypto.randomUUID(),
        description: "Academic transcripts",
        is_checked: false,
        category: "Education"
      }
    );
  }
  
  // Add some work-specific items
  if (purpose.toLowerCase().includes("work")) {
    items.push(
      { 
        id: crypto.randomUUID(),
        description: "Employment contract",
        is_checked: false,
        category: "Employment"
      },
      { 
        id: crypto.randomUUID(),
        description: "Work permit",
        is_checked: false,
        category: "Legal"
      },
      { 
        id: crypto.randomUUID(),
        description: "Professional credentials/certifications",
        is_checked: false,
        category: "Employment"
      }
    );
  }
  
  return items;
}

export default PackingSection;
