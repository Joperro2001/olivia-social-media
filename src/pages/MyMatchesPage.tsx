
import React, { useState } from "react";
import GroupCard from "@/components/besties/GroupCard";
import { useToast } from "@/hooks/use-toast";
import { matchedGroups } from "@/data/matchesMockData";
import CreateGroupButton from "@/components/besties/CreateGroupButton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const MyMatchesPage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredGroups = matchedGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleJoinRequest = (groupId: string) => {
    const group = matchedGroups.find((g) => g.id === groupId);
    if (group) {
      toast({
        title: "Join Request Sent!",
        description: `You've requested to join ${group.name}. We'll notify you when approved.`,
      });
    }
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between py-4 px-4">
        <h1 className="text-2xl font-bold">My Groups</h1>
        <div className="relative w-1/2 max-w-[200px]">
          <Input
            className="pl-8 bg-white"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-2.5 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="px-4 flex-1 overflow-auto">
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
              {searchQuery ? "No groups match your search" : "You haven't joined any groups yet"}
            </p>
          </div>
        )}
        
        <CreateGroupButton />
      </div>
    </div>
  );
};

export default MyMatchesPage;
