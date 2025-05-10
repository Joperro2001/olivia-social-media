
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  tags: string[];
  attendees: number;
  status: "Attended" | "RSVP'd";
}

interface EventListProps {
  events: Event[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
  const { toast } = useToast();
  
  const handleViewDetails = (title: string) => {
    toast({
      title: `Viewing details for ${title}`,
      description: "Full event details will be available in the complete version.",
      className: "bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white border-none",
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No events yet</h3>
        <p className="text-gray-500">
          RSVP to events to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <div className="flex">
            <div className="w-1/3">
              <img 
                src={event.image} 
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="w-2/3 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <Badge 
                  variant={event.status === "Attended" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {event.status}
                </Badge>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mt-1 mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs flex items-center text-gray-400">
                  <Users className="h-3 w-3 mr-1" /> {event.attendees} attendees
                </span>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleViewDetails(event.title)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default EventList;
