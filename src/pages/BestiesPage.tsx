
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Diamond, Heart, Sparkles, Users, RefreshCw, Brain, Globe, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileMatching from "@/components/besties/ProfileMatching";
import { useNavigate } from "react-router-dom";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAIRankProfiles } from "@/hooks/useAIRankProfiles";
import { useRanking } from "@/context/RankingContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const { 
    refetchProfiles, 
    userMoveInCity, 
    toggleCityFiltering, 
    filterByCity, 
    getUnviewedCount 
  } = useOtherProfiles();
  const { user } = useAuth();
  const { isRanking, rankProfiles, toggleAIRanking } = useAIRankProfiles();
  const { isAIRankingActive } = useRanking();
  const [unviewedCount, setUnviewedCount] = useState(0);
  
  useEffect(() => {
    // Update unviewed count periodically
    const interval = setInterval(() => {
      setUnviewedCount(getUnviewedCount());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [getUnviewedCount]);
  
  const handleOpenMatches = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    navigate("/matches");
  };

  const navigateToMyGroups = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    navigate('/my-groups');
  };
  
  const handleCreateGroup = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    toast({
      title: "Creating a new group",
      description: "You'll be able to create your own group in the full version!",
    });
  };

  const handleMatchFound = () => {
    // Only navigate if user is logged in
    if (user) {
      navigate("/matches");
    }
  };

  const handleLogin = () => {
    setShowLoginDialog(false);
    navigate("/signin");
  };

  const handleAIRanking = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    if (isAIRankingActive) {
      toggleAIRanking(false);
      toast({
        title: "AI ranking disabled",
        description: "Showing profiles in default order",
      });
    } else {
      toggleAIRanking(true);
      rankProfiles();
      toast({
        title: "AI ranking activated",
        description: "Ranking profiles based on compatibility",
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none",
      });
    }
  };

  const handleToggleFilters = () => {
    setShowFiltersDialog(true);
  };

  const handleToggleCityFilter = (enabled: boolean) => {
    toggleCityFiltering(enabled);
    
    toast({
      title: enabled ? "City filtering enabled" : "Showing all profiles",
      description: enabled 
        ? `Only showing profiles moving to ${userMoveInCity || "your city"}` 
        : "Showing profiles from all cities",
    });
  };

  useEffect(() => {
    // Force a refresh of profiles when the page loads
    refetchProfiles();
  }, []);

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Social</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={navigateToMyGroups}
            aria-label="View My Groups"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleOpenMatches}
            aria-label="View Matches"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              refetchProfiles();
              toast({
                title: "Refreshing profiles",
                description: userMoveInCity 
                  ? `Looking for new ${userMoveInCity} relocators...` 
                  : "Looking for new connections...",
              });
            }}
            aria-label="Refresh Profiles"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {filterByCity ? (
              <Sparkles className="h-4 w-4 text-amber-400" />
            ) : (
              <Globe className="h-4 w-4 text-blue-500" />
            )}
            <span className="font-medium">
              {filterByCity && userMoveInCity 
                ? `Moving to ${userMoveInCity}`
                : filterByCity 
                  ? "Find people moving to your city" 
                  : "Showing all profiles"}
            </span>
            
            {unviewedCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unviewedCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant={isAIRankingActive ? "default" : "outline"}
              size="sm"
              onClick={handleAIRanking}
              disabled={isRanking}
              className={`transition-all ${isAIRankingActive ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}`}
            >
              <Brain className={`h-4 w-4 mr-1 ${isRanking ? "animate-pulse" : ""}`} />
              {isRanking ? "Ranking..." : isAIRankingActive ? "AI Active" : "AI Rank"}
            </Button>
          </div>
        </div>

        <ProfileMatching onMatchFound={handleMatchFound} />
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be signed in to use this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Cancel</Button>
            <Button onClick={handleLogin}>Sign in</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Options</DialogTitle>
            <DialogDescription>
              Customize how profiles are displayed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="city-filter" className="text-base">City Filter</Label>
                <p className="text-sm text-muted-foreground">
                  Only show profiles moving to {userMoveInCity || "your city"}
                </p>
              </div>
              <Switch 
                id="city-filter"
                checked={filterByCity}
                onCheckedChange={handleToggleCityFilter}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setShowFiltersDialog(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BestiesPage;
