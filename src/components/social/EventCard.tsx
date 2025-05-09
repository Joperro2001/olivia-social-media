
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  tags: string[];
  attendees: number;
  onViewDetails: (id: string) => void;
  onRSVP: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  location,
  image,
  tags,
  attendees,
  onViewDetails,
  onRSVP,
}) => {
  return (
    <div
      className="relative h-64 rounded-2xl overflow-hidden shadow-md cursor-pointer"
      onClick={() => onViewDetails(id)}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
      </div>
      
      <div className="absolute top-3 right-3">
        <Badge className="bg-white/90 text-black hover:bg-white/80">
          {attendees} going
        </Badge>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <div className="flex items-center text-sm mb-2 opacity-90">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{date}</span>
        </div>
        <p className="text-sm mb-3 opacity-90">{location}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="bg-white/20 hover:bg-white/30 text-white text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRSVP(id);
            }}
            className="text-xs h-8"
            variant="secondary"
          >
            RSVP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
