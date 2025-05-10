
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profiles } from "@/data/bestiesMockData";
import ProfileMatching from "@/components/besties/ProfileMatching";
import BestiesFilter from "@/components/besties/BestiesFilter";
import MatchesDialog from "@/components/besties/MatchesDialog";
import { matchedProfiles } from "@/data/matchesMockData";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  
  const handleOpenMatches = () => {
    setShowMatches(true);
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="w-10">
          {/* Empty div for layout balance */}
        </div>
        <h1 className="text-2xl font-bold text-black">Social</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Suggested Connections</span>
        </div>

        {showFilters && <BestiesFilter />}
        <ProfileMatching 
          profiles={profiles} 
          onMatchFound={handleOpenMatches}
        />
        
        <MatchesDialog 
          open={showMatches} 
          onOpenChange={setShowMatches} 
          profiles={matchedProfiles}
        />
      </div>
    </div>
  );
};

export default BestiesPage;
