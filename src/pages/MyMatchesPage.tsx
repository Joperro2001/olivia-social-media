
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupCard from "@/components/besties/GroupCard";
import { useToast } from "@/hooks/use-toast";
import { matchedGroups } from "@/data/matchesMockData";
import CreateGroupButton from "@/components/besties/CreateGroupButton";
import GroupMatching from "@/components/besties/GroupMatching";
import { groups } from "@/data/bestiesMockData";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const MyMatchesPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-groups");
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleJoinRequest = (groupId: string) => {
    const group = matchedGroups.find((g) => g.id === groupId);
    if (group) {
      toast({
        title: "Join Request Sent!",
        description: `You've requested to join ${group.name}. We'll notify you when approved.`,
      });
    }
  };

  // Filter groups based on search term
  const filteredGroups = matchedGroups.filter((group) => {
    if (searchTerm === "") return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Search in name
    if (group.name.toLowerCase().includes(searchTermLower)) return true;
    
    // Search in description
    if (group.description.toLowerCase().includes(searchTermLower)) return true;
    
    // Search in tags
    if (group.tags.some(tag => tag.toLowerCase().includes(searchTermLower))) return true;
    
    return false;
  });

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">Groups</h1>
      </div>
      
      <div className="px-4 flex-1 overflow-auto">
        <Tabs defaultValue="my-groups" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-groups" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                className="pl-10"
                placeholder="Search groups..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <h2 className="text-lg font-medium mb-3">Your Groups</h2>
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex gap-3 items-center mb-3">
                      {group.image && (
                        <img 
                          src={group.image} 
                          alt={group.name} 
                          className="w-12 h-12 object-cover rounded-full" 
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.memberCount} members • Joined {group.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {group.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{group.description}</p>
                    <button className="w-full py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition">
                      Open Chat
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "No groups found matching your search" : "You haven't joined any groups yet"}
                </p>
              </div>
            )}
            
            <CreateGroupButton />
          </TabsContent>
          
          <TabsContent value="discover" className="flex flex-col h-[calc(100vh-180px)]">
            <GroupMatching 
              groups={groups} 
              onJoinRequest={handleJoinRequest} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyMatchesPage;
