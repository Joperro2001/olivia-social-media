
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/social/EventCard";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { Event } from "./SocialPage";

// Mock data for attended events
const attendedEvents: Event[] = [
  {
    id: "event2",
    title: "Weekend Hiking Trip",
    date: "Last Sat, 9:00 AM",
    location: "Grunewald Forest",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    tags: ["Outdoor", "Nature"],
    attendees: 12,
    category: "Explore",
  },
  {
    id: "event4",
    title: "German Language Exchange",
    date: "Last Wed, 6:30 PM",
    location: "International Hub, Neukölln",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000",
    tags: ["Education", "Language"],
    attendees: 18,
    category: "Learn",
  },
];

const AttendedEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewEventDetails = (id: string) => {
    navigate(`/event/${id}`);
  };

  const handleRSVP = (id: string) => {
    const event = attendedEvents.find((e) => e.id === id);
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
          <h1 className="text-2xl font-bold">Attended Events</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 py-4 px-4 overflow-y-auto">
        {attendedEvents.length > 0 ? (
          attendedEvents.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onViewDetails={handleViewEventDetails}
              onRSVP={handleRSVP}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">You haven't attended any events yet</p>
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

export default AttendedEventsPage;
