
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import CityResult from "@/components/moving/CityResult";
import { getUserCityMatch, clearCityMatch } from "@/services/cityMatchService";
import { useToast } from "@/hooks/use-toast";

const MyCityMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matchedCity, setMatchedCity] = useState<string | null>(null);
  const [matchReason, setMatchReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCityMatch = async () => {
      setLoading(true);
      try {
        // Try to get city match from Supabase first
        const cityMatchData = await getUserCityMatch();
        
        if (cityMatchData?.city) {
          setMatchedCity(cityMatchData.city);
          // Extract reason if available
          if (cityMatchData.matchData && cityMatchData.matchData.reason) {
            setMatchReason(cityMatchData.matchData.reason);
          } else if (cityMatchData.match_data && typeof cityMatchData.match_data === 'object') {
            // Handle reason from match_data if present (from database)
            const matchData = cityMatchData.match_data;
            if (matchData && typeof matchData === 'object' && 'reason' in matchData) {
              setMatchReason(matchData.reason as string);
            }
          }
        } else {
          // Fallback to localStorage
          const savedCity = localStorage.getItem("matchedCity");
          const savedReason = localStorage.getItem("matchedCityReason");
          if (savedCity) {
            setMatchedCity(savedCity);
            if (savedReason) {
              setMatchReason(savedReason);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching city match:", error);
        // Try fallback from localStorage
        const savedCity = localStorage.getItem("matchedCity");
        const savedReason = localStorage.getItem("matchedCityReason");
        if (savedCity) {
          setMatchedCity(savedCity);
          if (savedReason) {
            setMatchReason(savedReason);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCityMatch();
  }, []);
  
  const handleChatRedirect = () => {
    // Store a specific instruction in session storage for Olivia
    sessionStorage.setItem(
      "autoSendMessage", 
      "I'd like to take the City Match Quiz to find the perfect city for me based on my preferences and lifestyle"
    );
    // Navigate to Olivia's chat page
    navigate("/");
  };
  
  const handleReset = async () => {
    setLoading(true);
    try {
      // Clear the saved result from Supabase and localStorage
      await clearCityMatch();
      setMatchedCity(null);
      setMatchReason(null);
      toast({
        title: "Reset successful",
        description: "Your city match has been reset.",
      });
    } catch (error) {
      console.error("Error resetting city match:", error);
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "Could not reset your city match. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
        {loading ? (
          <Card className="border-primary/10 hover:shadow-md transition-shadow flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">Loading your city match...</p>
          </Card>
        ) : matchedCity ? (
          // If the user has already taken the quiz, show their match
          <Card className="border-primary/10 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Your Perfect City Match</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CityResult 
                city={matchedCity} 
                reason={matchReason}
                onReset={handleReset} 
              />
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={handleReset}>
                  Find a Different Match
                </Button>
              </div>
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
              <p>Chat with Olivia, our relocation assistant, to discover which city would be your perfect match based on your personality, lifestyle preferences, and goals!</p>
              <img 
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&h=400&q=80" 
                alt="City skyline" 
                className="rounded-lg mb-6 w-full max-w-md object-cover h-48 mx-auto"
              />
              <Button 
                className="w-full"
                onClick={handleChatRedirect}
              >
                Chat with Olivia to Find My Match
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyCityMatchPage;
