
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  tags: string[];
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  age,
  location,
  bio,
  image,
  tags,
  onSwipeLeft,
  onSwipeRight,
}) => {
  // In a real app, this would use proper touch gestures
  // For now, we'll use buttons to simulate swipes

  return (
    <div className="w-full h-[70vh] rounded-3xl overflow-hidden relative shadow-xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{name}</h2>
          <span className="text-xl">{age}</span>
        </div>
        <p className="text-sm mb-4">{location}</p>
        <p className="text-sm mb-4 line-clamp-3">{bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
        <button
          onClick={() => onSwipeLeft(id)}
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
          onClick={() => onSwipeRight(id)}
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
              stroke="#FF4A4A"
              fill="#FF4A4A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
