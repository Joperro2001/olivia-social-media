
import React, { useState } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import { Button } from "@/components/ui/button";
import { Search, Rainbow, UserPlus, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BestiesFilter from "@/components/besties/BestiesFilter";
import GroupCard from "@/components/besties/GroupCard";

const BestiesPage: React.FC = () => {
  const { toast } = useToast();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("suggested");
  const [showFilters, setShowFilters] = useState(false);
  
  const profiles = [
    {
      id: "1",
      name: "Emma",
      age: 26,
      location: "Berlin, Germany",
      bio: "Tech professional new to Berlin! Looking for friends to explore the city with and maybe find a flatmate for a cool Kreuzberg apartment.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000",
      tags: ["Tech", "Looking for flatmate 🏠", "Coffee lover", "Pride ally 🌈"],
    },
    {
      id: "2",
      name: "Miguel",
      age: 28,
      location: "Barcelona, Spain",
      bio: "Digital nomad working in graphic design. Currently looking for cool co-working buddies and weekend hiking friends!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000",
      tags: ["Digital Nomad", "Design", "Nature lover 🌿", "Queer spaces 🏳️‍🌈"],
    },
    {
      id: "3",
      name: "Aisha",
      age: 24,
      location: "London, UK",
      bio: "Graduate student studying International Relations. New in town and looking for friends to explore museums and try new restaurants!",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000",
      tags: ["Student", "Foodie 🍕", "New in town 🌍", "LGBTQ+ events"],
    },
  ];

  const groups = [
    {
      id: "group1",
      name: "Berlin Tech Enthusiasts",
      memberCount: 7,
      location: "Berlin, Germany",
      description: "A group for tech professionals in Berlin looking to network, share opportunities, and explore the city's tech scene together.",
      image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=1000",
      tags: ["Tech", "Networking", "Berlin", "Startups"],
      matchPercentage: 95
    },
    {
      id: "group2",
      name: "Rotterdam Housing Hunters",
      memberCount: 5,
      location: "Rotterdam, Netherlands",
      description: "Students and young professionals looking for affordable housing options in Rotterdam. We share listings, tips, and potentially look for flatmates.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000",
      tags: ["Housing", "Students", "Rotterdam", "Flatshare"],
      matchPercentage: 88
    },
    {
      id: "group3",
      name: "Barcelona Night Explorers",
      memberCount: 11,
      location: "Barcelona, Spain",
      description: "International interns and expats exploring Barcelona's nightlife, food scene, and cultural events. Always open to new members!",
      image: "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?q=80&w=1000",
      tags: ["Nightlife", "Food", "Culture", "Barcelona"],
      matchPercentage: 73
    }
  ];

  const handleSwipeLeft = (id: string) => {
    console.log(`Swiped left on ${id}`);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = (id: string) => {
    console.log(`Swiped right on ${id}`);
    toast({
      title: "It's a match! 🎉",
      description: `You and ${profiles[currentIndex].name} might be a good fit! We'll notify them.`,
      className: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white border-none",
    });
    
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

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
            
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              {profiles.length > 0 && currentIndex < profiles.length ? (
                <ProfileCard
                  key={profiles[currentIndex].id}
                  {...profiles[currentIndex]}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              ) : (
                <div className="text-center px-4 py-10">
                  <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
                  <p className="text-gray-500 mb-6">Check back later for new connections</p>
                  <Button 
                    onClick={() => setCurrentIndex(0)}
                    className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 transition-opacity"
                  >
                    Reset Profiles (Demo)
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-2">
            {showFilters && <BestiesFilter />}
            
            <div className="flex flex-col gap-4 pb-2">
              {groups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoinRequest={handleGroupJoinRequest}
                />
              ))}
              
              <div className="text-center py-4">
                <Button 
                  variant="outline"
                  className="mb-2"
                  onClick={() => {
                    toast({
                      title: "Creating a new group",
                      description: "You'll be able to create your own group in the full version!",
                    });
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Group
                </Button>
                
                <p className="text-sm text-gray-500 mt-1">
                  All group matches work through double opt-in to ensure everyone's comfort
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-2">
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Search className="h-10 w-10 mb-2 opacity-50" />
              <h3 className="text-lg font-medium">Search Coming Soon</h3>
              <p className="text-sm text-gray-500 mt-1">
                Advanced search will be available in the upcoming update
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BestiesPage;
