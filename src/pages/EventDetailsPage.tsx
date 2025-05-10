
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowLeft, Share, Heart, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface EventDetailsProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  description?: string;
  tags: string[];
  attendees: number;
  isPremium?: boolean;
}

const eventDetails: Record<string, EventDetailsProps> = {
  "event1": {
    id: "event1",
    title: "Expat Mixer @ Café Berlin",
    date: "Tomorrow, 7:00 PM",
    location: "Café Berlin, Mitte",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000",
    description: "Join fellow expats for a relaxed evening of conversation and networking. Meet people from around the world who have made Berlin their new home. First drink is on us!",
    tags: ["Social", "Networking"],
    attendees: 24,
    isPremium: true,
  },
  "event2": {
    id: "event2",
    title: "Weekend Hiking Trip",
    date: "Sat, 9:00 AM",
    location: "Grunewald Forest",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000",
    description: "Explore the beautiful Grunewald Forest with a group of outdoor enthusiasts. The hike is approximately 10km with moderate difficulty. Don't forget to bring water and comfortable shoes!",
    tags: ["Outdoor", "Nature"],
    attendees: 12,
  },
  "event3": {
    id: "event3",
    title: "Techno Tuesday @ Club Matrix",
    date: "Tue, 11:00 PM",
    location: "Club Matrix, Friedrichshain",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000",
    description: "Experience Berlin's legendary nightlife with the best techno DJs in town. Special guest DJ this week: Stef Mendesidis. Entry is free before midnight with the app QR code.",
    tags: ["Nightlife", "Music"],
    attendees: 87,
    isPremium: true,
  },
  "event4": {
    id: "event4",
    title: "German Language Exchange",
    date: "Wed, 6:30 PM",
    location: "International Hub, Neukölln",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000",
    description: "Practice your German in a relaxed atmosphere. All levels welcome! This weekly meetup pairs German speakers with learners for conversation practice. Snacks and refreshments provided.",
    tags: ["Education", "Language"],
    attendees: 18,
  },
};

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPremiumUser] = useState(false); // Simulating non-premium user by default
  
  const event = eventId && eventDetails[eventId] ? eventDetails[eventId] : null;
  
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FDF5EF] p-4">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button onClick={() => navigate("/social")}>Back to Events</Button>
      </div>
    );
  }
  
  const handleRSVP = () => {
    toast({
      title: "🎟️ RSVP'd!",
      description: `You're going to ${event.title}`,
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Share",
      description: "Sharing options will be available in the full version!",
    });
  };
  
  const handleSave = () => {
    toast({
      title: "Saved!",
      description: "Event added to your saved events",
    });
  };

  const handlePremiumFeature = () => {
    toast({
      title: "Premium Feature",
      description: "Upgrade to see the complete attendee list and connect with them!",
    });
  };

  return (
    <div className="flex flex-col min-h-[100vh] bg-[#FDF5EF] pb-24">
      {/* Header with back button */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-[#FDF5EF] z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/social")}
          className="text-black hover:bg-black/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Event Details</h1>
        <div className="w-9"></div> {/* Spacer for layout balance */}
      </div>
      
      {/* Event image */}
      <div className="relative w-full h-64">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {event.isPremium && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-semibold">
              <span className="flex items-center gap-1">
                Premium
              </span>
            </Badge>
          </div>
        )}
      </div>
      
      {/* Event details */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
        
        <div className="flex items-center text-sm mb-3 text-gray-700">
          <Calendar className="w-4 h-4 mr-2 text-primary" />
          <span>{event.date}</span>
        </div>
        
        <div className="flex items-center text-sm mb-4 text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-primary" />
          <span>{event.location}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm mb-4 text-gray-700">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-primary" />
            <span>{event.attendees} people attending</span>
          </div>
          
          {isPremiumUser ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-gradient-to-r from-[#9b87f5]/10 to-[#D946EF]/10 border-[#9b87f5]/30 text-[#7E69AB]"
              onClick={() => toast({
                title: "Attendee List",
                description: "This would show the full attendee list in the final version!"
              })}
            >
              See Who's Going
            </Button>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-gradient-to-r from-[#9b87f5]/10 to-[#D946EF]/10 border-[#9b87f5]/30 text-[#7E69AB]"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  See Who's Going
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <div className="text-center pt-2">
                    <div className="flex justify-center mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">Premium Feature</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      Unlock the complete attendee list and connect with like-minded people!
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:from-[#8B5CF6] hover:to-[#C026D3]"
                      onClick={handlePremiumFeature}
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        <div className="flex gap-2 mb-4">
          {event.tags.map((tag) => (
            <Badge key={tag} className="bg-secondary/20 text-secondary hover:bg-secondary/30">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="border-t border-gray-200 my-4"></div>
        
        <h3 className="text-lg font-semibold mb-2">About this event</h3>
        <p className="text-gray-700 mb-16">{event.description}</p>
      </div>
      
      {/* Bottom action buttons - increased margin bottom on text above */}
      <div className="fixed bottom-20 left-0 right-0 p-4 flex gap-2 bg-[#FDF5EF] border-t border-gray-200 shadow-sm">
        <Button 
          variant="outline" 
          className="flex-1 gap-2"
          onClick={handleSave}
        >
          <Heart className="w-4 h-4" />
          Save
        </Button>
        <Button 
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleShare}
        >
          <Share className="w-4 h-4" />
          Share
        </Button>
        <Button 
          className="flex-1"
          onClick={handleRSVP}
        >
          RSVP
        </Button>
      </div>
    </div>
  );
};

export default EventDetailsPage;
