
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface GroupMatchCardProps {
  group: {
    id: string;
    name: string;
    memberCount: number;
    location: string;
    description: string;
    image: string;
    tags: string[];
    matchPercentage: number;
  };
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
}

const GroupMatchCard: React.FC<GroupMatchCardProps> = ({
  group,
  onSwipeLeft,
  onSwipeRight,
}) => {
  return (
    <div className="w-full h-[70vh] rounded-3xl overflow-hidden relative shadow-xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${group.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>
      
      <div className="absolute top-4 left-4">
        <div className="h-2 w-24 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      </div>
      
      <div 
        className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-xs font-semibold shadow flex items-center"
      >
        <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">{group.matchPercentage}% Match</span>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <span className="text-sm flex items-center gap-1">
            <Users className="h-4 w-4" /> {group.memberCount}
          </span>
        </div>
        <p className="text-sm mb-4">{group.location}</p>
        <p className="text-sm mb-4 line-clamp-3">{group.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {group.tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
        <button
          onClick={() => onSwipeLeft(group.id)}
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="#FF4A4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#FF4A4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => onSwipeRight(group.id)}
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="url(#heart-gradient)"
              stroke="url(#heart-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" /> 
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GroupMatchCard;
