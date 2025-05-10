
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Rainbow, Sparkles, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BestiesFilter from "@/components/besties/BestiesFilter";
import ProfileMatching from "@/components/besties/ProfileMatching";
import GroupMatching from "@/components/besties/GroupMatching";
import SearchTab from "@/components/besties/SearchTab";
import CreateGroupButton from "@/components/besties/CreateGroupButton";
import { profiles, groups } from "@/data/bestiesMockData";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("suggested");
  const [showFilters, setShowFilters] = useState(false);
  
  const handleGroupJoinRequest = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    toast({
      title: "Request Sent! 🎉",
      description: `You've requested to join ${group?.name}. We'll notify you when the group approves.`,
      className: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none",
    });
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#D3E4FD] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="w-10">
          {/* Empty div for layout balance */}
        </div>
        <h1 className="text-2xl font-bold text-black">Besties</h1>
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
          <TabsList className="w-full grid grid-cols-3 mb-2">
            <TabsTrigger value="suggested" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>Suggested</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Groups</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggested" className="mt-2">
            {showFilters && <BestiesFilter />}
            <ProfileMatching profiles={profiles} />
          </TabsContent>

          <TabsContent value="groups" className="mt-2">
            {showFilters && <BestiesFilter />}
            <GroupMatching groups={groups} onJoinRequest={handleGroupJoinRequest} />
            <CreateGroupButton />
          </TabsContent>

          <TabsContent value="search" className="mt-2">
            <SearchTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BestiesPage;
