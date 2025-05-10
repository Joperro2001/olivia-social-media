
import React from "react";
import { Badge } from "@/components/ui/badge";

interface EventImageProps {
  image: string;
  title: string;
  isPremium?: boolean;
}

const EventImage: React.FC<EventImageProps> = ({ image, title, isPremium }) => {
  return (
    <div className="relative w-full h-64">
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover"
      />
      {isPremium && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-semibold">
            <span className="flex items-center gap-1">
              Premium
            </span>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default EventImage;
