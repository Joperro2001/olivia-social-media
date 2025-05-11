import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Diamond, Heart, Plus, Sparkles, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profiles } from "@/data/bestiesMockData";
import ProfileMatching from "@/components/besties/ProfileMatching";
import BestiesFilter from "@/components/besties/BestiesFilter";
import { useNavigate } from "react-router-dom";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  
  const handleOpenMatches = () => {
    navigate("/matches");
  };

  const navigateToMyGroups = () => {
    navigate('/my-groups');
  };
  
  const handleCreateGroup = () => {
    toast({
      title: "Creating a new group",
      description: "You'll be able to create your own group in the full version!",
    });
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Besties</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCreateGroup}
            aria-label="Create Group"
          >
            <div className="relative">
              <Plus className="h-5 w-5" />
              <Diamond className="h-3 w-3 absolute -bottom-1 -right-1 text-amber-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full animate-ping"></span>
            </div>
          </Button>
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
        </div>
      </div>
      
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="font-medium">Suggested Connections</span>
          </div>
        </div>

        {showFilters && <BestiesFilter />}
        <ProfileMatching 
          profiles={profiles} 
          onMatchFound={handleOpenMatches}
        />
      </div>
    </div>
  );
};

export default BestiesPage;
