
import React, { useState, useEffect } from "react";
import { ArrowsUpFromLine, Package, Map, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const CityPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [hasChecklist, setHasChecklist] = useState<boolean>(false);

  // Check if user has a checklist
  useEffect(() => {
    // In a real app, this would check from API or localStorage
    // For demo purposes, we'll check if there's any saved checklist data
    const savedChecklist = localStorage.getItem("cityPackerData");
    setHasChecklist(!!savedChecklist);
  }, []);
  
  const handleChatRedirect = (message: string) => {
    // Store the message in session storage so it can be picked up by the chat page
    sessionStorage.setItem("autoSendMessage", message);
    // Navigate to the chat page
    navigate("/");
  };
  
  return <div className="flex flex-col h-screen bg-[#FDF5EF]">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">City</h1>
        <div className="flex items-center gap-2">
          {/* Removed from top header */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28"> 
        <div className="space-y-5">
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                
                <CardTitle>City Matcher</CardTitle>
              </div>
              <CardDescription className="text-base italic">
                "I'm choosing my next exchange destination."
              </CardDescription>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className={`flex items-center gap-1 absolute ${isMobile ? 'top-2 right-3' : 'top-3 right-4'} bg-primary/10 hover:bg-primary/20 text-primary border-primary/30`} onClick={() => navigate("/my-city-match")}>
                <Sparkles className="h-4 w-4" />
                {isMobile ? "View" : "My Match"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Tell Olivia what matters to you — lifestyle, budget, weather, language, vibes — and she'll help you find your perfect match.
              </p>
              <Button className="w-full" onClick={() => handleChatRedirect("Find my City Match")}>
                Find My Match
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>City Packer</CardTitle>
              </div>
              <CardDescription className="text-base italic">
                "I know where I'm going. Now what do I need?"
              </CardDescription>
              {/* Removed the button from here */}
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Olivia will build your personalized moving checklist: visa requirements, SIM cards, health insurance, local apps, housing tips, and exactly what to pack.
              </p>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/my-city-packer")}>
                <Eye className="h-4 w-4 mr-1" />
                My Checklist
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 hover:shadow-md transition-shadow mb-4">
            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                
                <CardTitle>City Explorer</CardTitle>
              </div>
              <CardDescription className="text-base italic">
                "I've just arrived. Help me settle in!"
              </CardDescription>
              <Button variant="outline" size={isMobile ? "sm" : "default"} className={`flex items-center gap-1 absolute ${isMobile ? 'top-2 right-3' : 'top-3 right-4'} bg-accent/10 hover:bg-accent/20 text-accent-dark border-accent/30`} onClick={() => navigate("/my-city-explorer")}>
                <Map className="h-4 w-4" />
                {isMobile ? "View" : "My Guide"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Get Olivia's curated local guides, event suggestions, friend-finder features, must-know tips, and city-specific hacks to feel at home fast.
              </p>
              <Button className="w-full" variant="accent" onClick={() => handleChatRedirect("Help me explore my new city")}>
                Explore My City
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};

export default CityPage;
