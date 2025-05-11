
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Map } from "lucide-react";

const MyCityExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [hasGuide, setHasGuide] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user has already created a city guide
    const savedGuide = localStorage.getItem("cityGuide");
    if (savedGuide) {
      setHasGuide(true);
    }
  }, []);
  
  const handleChatRedirect = () => {
    // Store the message in session storage so it can be picked up by the chat page
    sessionStorage.setItem("autoSendMessage", "Help me explore my new city");
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
          <h1 className="text-2xl font-bold">My City Explorer</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        {hasGuide ? (
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle>Your City Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Here you'll find your personalized city guide with local recommendations, events, and tips.</p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Saved Recommendations</h3>
                <p className="text-muted-foreground">Your personalized city recommendations will appear here once you create them with Olivia.</p>
              </div>
              
              <Button 
                className="w-full" 
                variant="accent"
                onClick={handleChatRedirect}
              >
                Update My Guide
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <CardTitle>Create Your City Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You haven't created a city guide yet. Let Olivia help you discover the best of your new city with personalized recommendations!</p>
              
              <img 
                src="https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&h=400&q=80" 
                alt="City exploration" 
                className="rounded-lg mb-6 w-full max-w-md object-cover h-48 mx-auto"
              />
              
              <Button 
                className="w-full" 
                variant="accent"
                onClick={handleChatRedirect}
              >
                Explore My City
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyCityExplorerPage;
