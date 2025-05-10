
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventActionsProps {
  eventTitle: string;
}

const EventActions: React.FC<EventActionsProps> = ({ eventTitle }) => {
  const { toast } = useToast();
  
  const handleRSVP = () => {
    toast({
      title: "🎟️ RSVP'd!",
      description: `You're going to ${eventTitle}`,
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
  
  return (
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
  );
};

export default EventActions;
