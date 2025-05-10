
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface EventInfoProps {
  title: string;
  date: string;
  location: string;
  attendees: number;
  tags: string[];
  description?: string;
  isPremiumUser: boolean;
}

const EventInfo: React.FC<EventInfoProps> = ({ 
  title, 
  date, 
  location, 
  attendees, 
  tags, 
  description,
  isPremiumUser
}) => {
  const { toast } = useToast();
  
  const handlePremiumFeature = () => {
    toast({
      title: "Premium Feature",
      description: "Upgrade to see the complete attendee list and connect with them!",
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      
      <div className="flex items-center text-sm mb-3 text-gray-700">
        <Calendar className="w-4 h-4 mr-2 text-primary" />
        <span>{date}</span>
      </div>
      
      <div className="flex items-center text-sm mb-4 text-gray-700">
        <MapPin className="w-4 h-4 mr-2 text-primary" />
        <span>{location}</span>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-4 text-gray-700">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-primary" />
          <span>{attendees} people attending</span>
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
        {tags.map((tag) => (
          <Badge key={tag} className="bg-secondary/20 text-secondary hover:bg-secondary/30">
            {tag}
          </Badge>
        ))}
      </div>
      
      <div className="border-t border-gray-200 my-4"></div>
      
      <h3 className="text-lg font-semibold mb-2">About this event</h3>
      <p className="text-gray-700 mb-16">{description}</p>
    </div>
  );
};

export default EventInfo;
