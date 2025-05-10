
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { matchedGroups } from "@/data/matchesMockData";
import CategoryTabs from "@/components/social/CategoryTabs";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import GroupCard from "@/components/social/GroupCard";
import CreateGroupButton from "@/components/besties/CreateGroupButton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Filter groups based on active category
  const filteredGroups = groupsWithCategories.filter(
    group => activeCategory === group.category
  );
  
  // Filter groups in drawer based on search term
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

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="w-10">
          {/* Empty div for layout balance */}
        </div>
        <h1 className="text-2xl font-bold">Groups</h1>
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-pink-500 hover:text-pink-600 hover:bg-pink-100"
              aria-label="View Joined Groups"
            >
              <Users className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>My Groups</DrawerTitle>
              <DrawerDescription>View and manage your joined groups</DrawerDescription>
            </DrawerHeader>
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
                      <Button className="w-full" variant="outline">
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
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
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
      
      <div className="px-4">
        <CreateGroupButton />
      </div>
    </div>
  );
};

export default MyMatchesPage;
