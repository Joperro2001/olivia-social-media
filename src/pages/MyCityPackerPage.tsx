
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package } from "lucide-react";

const MyCityPackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasChecklist, setHasChecklist] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user has already created a packing checklist
    const savedChecklist = localStorage.getItem("cityPackerData");
    if (savedChecklist) {
      setHasChecklist(true);
    }
  }, []);
  
  const handleChatRedirect = () => {
    // Store the message in session storage so it can be picked up by the chat page
    sessionStorage.setItem("autoSendMessage", "Create my moving checklist");
    // Navigate to the chat page
    navigate("/");
  };
  
  return (
    <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/city")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My City Packer</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        <Card className="border-primary/10 hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>You Don't Have a Packing Checklist Yet</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You haven't created a moving checklist yet. Let Olivia help you build a personalized checklist with everything you need for your move.</p>
            
            <img 
              src="https://images.unsplash.com/photo-1622186477895-f2af6a0f5a97?auto=format&fit=crop&w=600&h=400&q=80" 
              alt="Moving boxes and packing" 
              className="rounded-lg mb-6 w-full max-w-md object-cover h-48 mx-auto"
            />
            
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={handleChatRedirect}
            >
              Create My Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyCityPackerPage;
