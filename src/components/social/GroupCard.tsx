
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface GroupCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  image: string;
  tags: string[];
  category: string;
  location: string;
  onViewDetails: (id: string) => void;
  onJoinRequest: (id: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  id,
  name,
  description,
  memberCount,
  image,
  tags,
  location,
  onViewDetails,
  onJoinRequest,
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
          {memberCount} members
        </Badge>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <div className="flex items-center text-sm mb-2 opacity-90">
          <Users className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>
        <p className="text-sm mb-3 opacity-90 line-clamp-2">{description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {tags.slice(0, 3).map((tag) => (
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
              onJoinRequest(id);
            }}
            className="text-xs h-8"
            variant="secondary"
          >
            Join Group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
