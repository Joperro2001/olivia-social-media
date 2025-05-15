
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "@/components/social/EventCard";
import CategoryTabs from "@/components/social/CategoryTabs";
import { useToast } from "@/hooks/use-toast";
import { Heart, Calendar, Plus, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRanking } from "@/context/RankingContext";
import { Profile } from "@/types/Profile";

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  tags: string[];
  attendees: number;
  category: string;
}

const SocialPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Chill");
  const { isAIRankingActive, rankedProfiles } = useRanking();
  
  const categories = ["Chill", "Explore", "Party", "Learn"];
  
  // Define regular events
  const regularEvents = [
    {
      id: "event1",
      title: "Expat Mixer @ Café Berlin",
      date: "Tomorrow, 7:00 PM",
      location: "Café Berlin, Mitte",
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000",
      tags: ["Social", "Networking"],
      attendees: 24,
      category: "Chill",
    },
    {
      id: "event2",
      title: "Weekend Hiking Trip",
      date: "Sat, 9:00 AM",
      location: "Grunewald Forest",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
      tags: ["Outdoor", "Nature"],
      attendees: 12,
      category: "Explore",
    },
    {
      id: "event3",
      title: "Techno Tuesday @ Club Matrix",
      date: "Tue, 11:00 PM",
      location: "Club Matrix, Friedrichshain",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000",
      tags: ["Nightlife", "Music"],
      attendees: 87,
      category: "Party",
    },
    {
      id: "event4",
      title: "German Language Exchange",
      date: "Wed, 6:30 PM",
      location: "International Hub, Neukölln",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000",
      tags: ["Education", "Language"],
      attendees: 18,
      category: "Learn",
    },
  ];
  
  // Create AI recommended events based on ranked profiles
  const aiRecommendedEvents = React.useMemo(() => {
    if (!isAIRankingActive || rankedProfiles.length === 0) return [];
    
    // Convert ranked profiles to events (top 3 profiles)
    return rankedProfiles.slice(0, 3).map((profile, index) => {
      const category = categories[index % categories.length]; // Distribute across categories
      
      return {
        id: `ai-event-${profile.id}`,
        title: `Meet Up with ${profile.full_name.split(' ')[0]}`,
        date: "Soon",
        location: profile.current_city || "Berlin",
        image: profile.avatar_url || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000",
        tags: ["AI Match", profile.university ? "University" : "Networking"],
        attendees: Math.floor(Math.random() * 10) + 2, // Random small number
        category: category,
        profileId: profile.id, // Store profile ID to link to chat
      };
    });
  }, [isAIRankingActive, rankedProfiles, categories]);
  
  // Combine regular and AI events, with AI events at the top
  const allEvents = React.useMemo(() => {
    return [...aiRecommendedEvents, ...regularEvents];
  }, [aiRecommendedEvents, regularEvents]);
  
  // Filter events by active category
  const filteredEvents = allEvents.filter(
    (event) => activeCategory === event.category
  );
  
  const handleViewEventDetails = (id: string, profileId?: string) => {
    console.log(`View details for event ${id}`);
    
    // If it's an AI event with profileId, navigate to chat
    if (profileId) {
      navigate(`/chat/${profileId}`);
    } else {
      navigate(`/event/${id}`);
    }
  };
  
  const handleRSVP = (id: string) => {
    console.log(`RSVP for event ${id}`);
    const event = allEvents.find((e) => e.id === id);
    if (event) {
      // Save the RSVP'd event to localStorage
      const rsvpEvents = JSON.parse(localStorage.getItem("rsvpEvents") || "[]");
      if (!rsvpEvents.includes(id)) {
        rsvpEvents.push(id);
        localStorage.setItem("rsvpEvents", JSON.stringify(rsvpEvents));
      }
      
      toast({
        title: "🎟️ RSVP'd!",
        description: `You're going to ${event.title}`,
      });
    }
  };
  
  const handleViewSavedEvents = () => {
    console.log("Viewing saved events");
    navigate("/saved-events");
  };
  
  const handleViewAttendedEvents = () => {
    console.log("Viewing attended events");
    navigate("/attended-events");
  };

  const handleCreateEvent = () => {
    console.log("Creating new event");
    navigate("/create-event");
  };
  
  const handleGoToBesties = () => {
    navigate("/besties");
  };
  
  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleViewSavedEvents}
            className="rounded-full"
          >
            <Heart className="h-5 w-5 text-gray-600" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleViewAttendedEvents}
            className="rounded-full"
          >
            <Calendar className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            onClick={handleCreateEvent}
            className="rounded-full bg-primary hover:bg-primary/90 flex items-center gap-1 px-3"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
        </div>
      </div>
      
      {isAIRankingActive && rankedProfiles.length > 0 && (
        <div className="px-4 mb-2">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">AI suggested events based on your matching preferences</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleGoToBesties} className="text-xs">
              View Matches
            </Button>
          </div>
        </div>
      )}
      
      <div className="px-4">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 py-4 px-4 overflow-y-auto">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onViewDetails={() => handleViewEventDetails(event.id, (event as any).profileId)}
              onRSVP={handleRSVP}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No events in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
