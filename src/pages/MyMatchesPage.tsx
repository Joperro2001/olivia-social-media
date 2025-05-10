
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { matchedGroups } from "@/data/matchesMockData";
import CategoryTabs from "@/components/social/CategoryTabs";
import { Plus, Users } from "lucide-react";
import GroupCard from "@/components/social/GroupCard";

// Extend the matched groups data with categories
const groupsWithCategories = matchedGroups.map(group => ({
  ...group,
  category: assignCategory(group.tags),
  location: group.joinDate.includes("ago") ? "Berlin, Germany" : "Rotterdam, Netherlands",
  image: group.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000"
}));

// Function to assign a category based on tags
function assignCategory(tags: string[]): string {
  const tagLower = tags.map(tag => tag.toLowerCase());
  
  if (tagLower.some(tag => ["tech", "networking", "digital", "programming"].includes(tag))) {
    return "Tech";
  } else if (tagLower.some(tag => ["social", "community", "friends"].includes(tag))) {
    return "Social";
  } else if (tagLower.some(tag => ["housing", "apartment", "roommate"].includes(tag))) {
    return "Housing";
  } else if (tagLower.some(tag => ["hobby", "art", "music", "craft"].includes(tag))) {
    return "Hobbies";
  } else {
    return "General";
  }
}

const categories = ["Tech", "Social", "Housing", "Hobbies", "General"];

const MyMatchesPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Social");

  // Filter groups based on active category
  const filteredGroups = groupsWithCategories.filter(
    group => activeCategory === group.category
  );

  const handleViewGroupDetails = (id: string) => {
    console.log(`View details for group ${id}`);
    // In a real app, this would open a modal with group details
  };
  
  const handleJoinRequest = (groupId: string) => {
    console.log(`Join request for group ${groupId}`);
    const group = groupsWithCategories.find((g) => g.id === groupId);
    if (group) {
      toast({
        title: "Join Request Sent!",
        description: `You've requested to join ${group.name}. We'll notify you when approved.`,
      });
    }
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
        <div className="w-10">
          {/* Empty div for layout balance */}
        </div>
        <h1 className="text-2xl font-bold">Groups</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCreateGroup}
            className="text-pink-500 hover:text-pink-600 hover:bg-pink-100"
            aria-label="Create New Group"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/my-groups')}
            className="text-pink-500 hover:text-pink-600 hover:bg-pink-100"
            aria-label="View Joined Groups"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-4">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 py-4 px-4 overflow-y-auto">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              {...group}
              onViewDetails={handleViewGroupDetails}
              onJoinRequest={handleJoinRequest}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No groups in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMatchesPage;
