
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flag, Globe, University, Sparkles } from "lucide-react";
import { useRanking } from "@/context/RankingContext";

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
  onSwipeRight
}) => {
  const { isAIRankingActive } = useRanking();
  
  // Extract city from location
  const getCity = (location: string): string => {
    if (!location) return "Unknown location";
    const cityPart = location.split(',')[0];
    return cityPart.trim();
  };

  const handleSwipeRight = () => {
    // Save the match to localStorage
    const matches = JSON.parse(localStorage.getItem("matches") || "[]");
    if (!matches.includes(id)) {
      matches.push(id);
      localStorage.setItem("matches", JSON.stringify(matches));
    }
    onSwipeRight(id);
  };

  // Generate a random image URL based on the user's ID
  const getRandomDefaultImage = (userId: string) => {
    // List of potential placeholder images with different styles
    const placeholderImages = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", // Person 1
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330", // Person 2
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80", // Person 3
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", // Person 4
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2", // Person 5
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb", // Person 6
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6", // Person 7
      "https://images.unsplash.com/photo-1517841905240-472988babdf9"  // Person 8
    ];
    
    // Create a deterministic but seemingly random selection based on user ID
    // This ensures the same user always gets the same image
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const index = hashCode(userId) % placeholderImages.length;
    return placeholderImages[index];
  };

  // Use a random default image if no image is provided
  const displayImage = image || getRandomDefaultImage(id);
  
  const city = getCity(location);

  // Debug log profile info to help diagnose issues
  console.log(`Rendering profile card for ${name} (${id}), age: ${age}, location: ${location}`);

  return (
    <div className="w-full h-[70vh] rounded-3xl overflow-hidden relative shadow-xl">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${displayImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>
      
      {isAIRankingActive && (
        <div className="absolute top-4 right-4 z-10">
          <Badge 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none flex items-center gap-1 px-3 py-1.5"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Ranked</span>
          </Badge>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{name || "Anonymous"}</h2>
          <span className="text-xl">{age || "?"}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Flag className="h-4 w-4" />
          <p className="text-sm">{city}</p>
        </div>
        
        <p className="text-sm mb-4 line-clamp-3">{bio || "No bio available"}</p>
        
        <div className="flex flex-wrap gap-2 mb-16">
          {tags && tags.length > 0 ? tags.map(tag => (
            <Badge 
              key={tag} 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              {tag}
            </Badge>
          )) : (
            <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
              No tags
            </Badge>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
        <button 
          onClick={() => onSwipeLeft(id)} 
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          aria-label="Dislike"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button 
          onClick={handleSwipeRight} 
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          aria-label="Like"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#heart-gradient)" stroke="url(#heart-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF416C" />
                <stop offset="100%" stopColor="#FF4B2B" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
