
import React, { useState } from "react";
import MatchesList from "@/components/besties/MatchesList";
import { matchedProfiles } from "@/data/matchesMockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles] = useState(matchedProfiles);

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center px-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/besties")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center pr-8">My Matches</h1>
      </div>

      <div className="px-4 pb-4 flex-1 overflow-y-auto">
        <MatchesList profiles={profiles} />
      </div>
    </div>
  );
};

export default MatchesPage;
