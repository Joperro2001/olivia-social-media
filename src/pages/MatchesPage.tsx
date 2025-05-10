
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MatchesList from "@/components/besties/MatchesList";
import { matchedProfiles } from "@/data/matchesMockData";

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-pink-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-black">Your Matches</h1>
        <div className="w-10">
          {/* Empty div for layout balance */}
        </div>
      </div>
      
      <div className="px-4 pb-4 flex-1 overflow-auto">
        <MatchesList profiles={matchedProfiles} />
      </div>
    </div>
  );
};

export default MatchesPage;
