
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";
import CityResult from "@/components/moving/CityResult";

const MyCityMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const [matchedCity, setMatchedCity] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user has already taken the city match quiz
    const savedCity = localStorage.getItem("matchedCity");
    if (savedCity) {
      setMatchedCity(savedCity);
    }
  }, []);
  
  const handleChatRedirect = () => {
    // Store the message in session storage so it can be picked up by the chat page
    sessionStorage.setItem("autoSendMessage", "Find my City Match");
    // Navigate to the chat page
    navigate("/");
  };
  
  const handleReset = () => {
    // Clear the saved result and reset the state
    localStorage.removeItem("matchedCity");
    setMatchedCity(null);
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
          <h1 className="text-2xl font-bold">My City Match</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto pb-28">
        {matchedCity ? (
          // If the user has already taken the quiz, show their match
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Your Perfect City Match</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CityResult city={matchedCity} onReset={handleReset} />
            </CardContent>
          </Card>
        ) : (
          // If the user hasn't taken the quiz, show a prompt
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Find Your City Match</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You haven't taken the City Match quiz yet. Take our fun questionnaire to discover which city would be your perfect match based on your personality, lifestyle preferences, and goals!</p>
              <img 
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=400&q=80" 
                alt="City skyline" 
                className="rounded-lg mb-6 w-full max-w-md object-cover h-48 mx-auto"
              />
              <Button 
                className="w-full"
                onClick={handleChatRedirect}
              >
                Find My Match
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyCityMatchPage;
