
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Diamond, Heart, Sparkles, Users, RefreshCw, Brain, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileMatching from "@/components/besties/ProfileMatching";
import { useNavigate } from "react-router-dom";
import { useOtherProfiles } from "@/hooks/useOtherProfiles";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAIRankProfiles } from "@/hooks/useAIRankProfiles";
import { supabase } from "@/integrations/supabase/client";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { refetchProfiles, userMoveInCity } = useOtherProfiles();
  const { user } = useAuth();
  const { isRanking, rankProfiles, isAIRankingActive, toggleAIRanking } = useAIRankProfiles();
  const [isCreatingDemoUsers, setIsCreatingDemoUsers] = useState(false);
  
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

  // Function to create demo profiles directly
  const createDemoProfiles = async () => {
    try {
      setIsCreatingDemoUsers(true);
      toast({
        title: "Creating demo profiles",
        description: "Please wait while we create profiles for you to match with...",
      });

      // Call the create-profiles function
      const { data, error } = await supabase.functions.invoke('create-profiles');
      
      if (error) {
        console.error("Error creating profiles:", error);
        throw error;
      }
      
      console.log("Demo profiles creation result:", data);
      
      toast({
        title: "Demo profiles created successfully!",
        description: data?.message || "New profiles are available for matching",
        className: "bg-gradient-to-r from-green-500 to-green-700 text-white border-none",
      });
      
      // Force a refresh of profiles
      refetchProfiles();
    } catch (error: any) {
      console.error("Error creating demo profiles:", error);
      toast({
        title: "Error creating profiles",
        description: error.message || "Failed to create demo profiles",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDemoUsers(false);
    }
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
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="font-medium">
              {userMoveInCity ? `Moving to ${userMoveInCity}` : "Find people moving to your city"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createDemoProfiles}
              disabled={isCreatingDemoUsers}
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              {isCreatingDemoUsers ? "Creating..." : "Create Demo Profiles"}
            </Button>
            <Button
              variant={isAIRankingActive ? "default" : "outline"}
              size="sm"
              onClick={handleAIRanking}
              disabled={isRanking}
              className={isAIRankingActive ? "bg-gradient-to-r from-blue-500 to-purple-500" : ""}
            >
              <Brain className="h-4 w-4 mr-1" />
              AI {isRanking && "Ranking..."}
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
    </div>
  );
};

export default BestiesPage;
