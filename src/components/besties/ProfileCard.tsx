
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flag, Globe, University } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  tags: string[];
  onSwipeLeft?: (id: string) => void;
  onSwipeRight?: (id: string) => void;
  university?: string;
  nationality?: string;
  clickable?: boolean;
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
  university = "University",
  nationality = "British",
  clickable = true
}) => {
  const navigate = useNavigate();

  // Get country flag from location
  const getCountryFlag = (location: string): string => {
    const countryMap: {[key: string]: string} = {
      'Germany': '🇩🇪',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'UK': '🇬🇧',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Italy': '🇮🇹'
    };
    
    // Check if location contains any country name
    for (const country in countryMap) {
      if (location.includes(country)) {
        return countryMap[country];
      }
    }
    
    return ''; // Default if no match
  };

  // Extract city from location
  const getCity = (location: string): string => {
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
    onSwipeRight?.(id);
  };

  const handleCardClick = () => {
    if (clickable) {
      navigate(`/profile/${id}`);
    }
  };

  const city = getCity(location);
  const countryFlag = getCountryFlag(location);

  return (
    <div 
      className="w-full h-[70vh] rounded-3xl overflow-hidden relative shadow-xl"
      onClick={handleCardClick}
    >
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
        
        {/* User Information Section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <University className="h-4 w-4" />
            <p className="text-sm">{university}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <p className="text-sm">{nationality}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            <p className="text-sm">{countryFlag} {city}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-16">
          {tags.map(tag => (
            <Badge 
              key={tag} 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {onSwipeLeft && onSwipeRight && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-8">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSwipeLeft(id);
            }} 
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="#FF4A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSwipeRight();
            }} 
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
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
      )}
    </div>
  );
};

export default ProfileCard;
