
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BestiesFilter from "@/components/besties/BestiesFilter";
import ProfileMatching from "@/components/besties/ProfileMatching";
import { profiles } from "@/data/bestiesMockData";
import MatchesList from "@/components/besties/MatchesList";
import { matchedProfiles } from "@/data/matchesMockData";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suggested");
  const [showFilters, setShowFilters] = useState(false);
  
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
        <Tabs defaultValue="suggested" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="suggested" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Suggested</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Matches</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggested" className="mt-2">
            {showFilters && <BestiesFilter />}
            <ProfileMatching profiles={profiles} />
          </TabsContent>

          <TabsContent value="matches" className="mt-2">
            <MatchesList profiles={matchedProfiles} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BestiesPage;
