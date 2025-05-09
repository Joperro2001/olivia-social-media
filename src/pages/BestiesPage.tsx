
import React, { useState } from "react";
import ProfileCard from "@/components/besties/ProfileCard";
import { Button } from "@/components/ui/button";
import { Search, Rainbow, UserPlus, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BestiesFilter from "@/components/besties/BestiesFilter";

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

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-gradient-to-b from-lavender-light to-white">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center">
          <Rainbow className="h-5 w-5 mr-2 text-pink-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Besties</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mb-4">
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
        </Tabs>
        
        {showFilters && <BestiesFilter />}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
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
    </div>
  );
};

export default BestiesPage;
