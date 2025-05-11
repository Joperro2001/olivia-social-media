
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/social/EventCard";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { Event } from "./SocialPage";

// Mock data for saved events
const savedEvents: Event[] = [
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
    id: "event3",
    title: "Techno Tuesday @ Club Matrix",
    date: "Tue, 11:00 PM",
    location: "Club Matrix, Friedrichshain",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000",
    tags: ["Nightlife", "Music"],
    attendees: 87,
    category: "Party",
  },
];

const SavedEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewEventDetails = (id: string) => {
    navigate(`/event/${id}`);
  };

  const handleRSVP = (id: string) => {
    const event = savedEvents.find((e) => e.id === id);
    if (event) {
      toast({
        title: "🎟️ RSVP'd!",
        description: `You're going to ${event.title}`,
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between py-4 px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Saved Events</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 py-4 px-4 overflow-y-auto">
        {savedEvents.length > 0 ? (
          savedEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onViewDetails={handleViewEventDetails}
              onRSVP={handleRSVP}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No saved events yet</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/social')}
            >
              Discover Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedEventsPage;
