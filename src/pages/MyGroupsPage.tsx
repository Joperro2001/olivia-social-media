
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matchedGroups } from "@/data/matchesMockData";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const MyGroupsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Filter groups based on search term
  const searchFilteredGroups = matchedGroups.filter((group) => {
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

  const handleOpenChat = (groupId: string) => {
    const group = matchedGroups.find((g) => g.id === groupId);
    if (group) {
      toast({
        title: "Opening chat",
        description: `Chat with ${group.name} will be available in the full version!`,
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleCreateGroup = () => {
    toast({
      title: "Premium Feature",
      description: "Creating groups is available for premium users only!",
    });
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between py-4 px-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleGoBack}
          className="text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">My Groups</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateGroup}
          className="text-gray-600"
          aria-label="Create Group (Premium Feature)"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="px-4 pb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            className="pl-10"
            placeholder="Search your groups..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {searchFilteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 py-4">
            {searchFilteredGroups.map((group) => (
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
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.memberCount} members • Joined {group.joinDate}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {group.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-3">{group.description}</p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleOpenChat(group.id)}
                >
                  Open Chat
                </Button>
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
      </div>
    </div>
  );
};

export default MyGroupsPage;
